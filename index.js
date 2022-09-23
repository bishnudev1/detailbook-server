const express = require('express');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const Auth = require('./middleware/Auth');
const cors = require('cors');

require('dotenv').config({ path: 'config.env' });

const port = process.env.PORT || 5000;



const app = express();

const corsOptions ={
    origin:'https://detailbook-server.herokuapp.com', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200,
 }

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

require('./db/conn');

const User = require('./models/users');
const Stories = require('./models/stories');

app.get('/', async (req, res) => {
    res.status(201).send('Hola sir, I am from server of Detailbook !');
});

app.get('/about', Auth, (req, res) => {
    res.status(201).send(req.user);
});

app.post('/register', async (req, res) => {

    const { name, age, email, password, cpassword, work, intro } = req.body;

    if (!name || !age || !email || !password || !cpassword || !work || !intro) {
        res.status(422).json({ alert: 'Fill all the details' });
    }
    else {
        const isExist = await User.findOne({ email: email });
        console.log(isExist);
        if (isExist) {
            res.status(422).json({ error: 'User already exists! Try login' });
        }
        else {
            try {
                if (password !== cpassword) {
                    res.status(201).json({ error: 'Password mismatch' });
                }
                else {
                    const newUser = new User({ name, age, email, password, cpassword, work, intro });
                    const token = await newUser.generateToken();
                    const saveUser = await newUser.save();
                    res.status(201).json({ success: 'New user added!' });
                }
            } catch (error) {
                console.log(error);
            }
        }
    }
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(422).json({ error: 'Fill all the details' });
    }
    else {
        try {
            const isExist = await User.findOne({ email: email });
            if (isExist) {
                const isMatched = await bcrypt.compare(password, isExist.password);
                if (isMatched) {
                    const token = await isExist.generateToken();
                    res.cookie('jwt', token, {
                        //expires: new Date(Date.now() + 1000000),
                        httpOnly: true
                    });
                    console.log(token);
                    res.status(201).json({ success: 'Login successful!' });
                }
                else {
                    res.status(422).json({ error: 'Wrong credintionals!' });
                }
            }
            else {
                res.status(422).json({ warning: 'User does not exists! Try register' });
            }
        } catch (error) {
            console.log(error);
        }
    }
})

app.get('/logout', (req, res) => {
    res.clearCookie('jwt', { path: "/" });
    res.status(200).json({ success: 'User logged out' });
});

app.get('/users', async (req, res) => {
    const allUsers = await User.find();
    res.status(201).send(allUsers);
});

app.get('/stories', async (req, res) => {
    const allStories = await Stories.find();
    res.status(201).send(allStories);
});

app.post('/post-story', Auth, async (req, res) => {
    const { title, desc } = req.body;
    const { name } = req.user;

    if (!title || !desc) {
        res.status(422).json({ error: 'Fiil all the details' });
    }
    else {
        const addStory = new Stories({ title, desc, name });
        const saveStory = await addStory.save();
        if (saveStory) {
            res.status(201).json({ success: 'Story has been added' });
        }
        else {
            res.status(404).json({ error: 'Something went wrong' });
        }
    }
})

app.put('/update-profile/:id', async (req, res) => {
    const { newname, newage, newemail, newwork, newintro } = req.body;
    const id = req.params.id;
    try {
        User.findById(id, async function (err, docs) {
            if (err) {
                console.log(err);
            }
            else {
                docs.name = newname;
                docs.age = newage;
                docs.email = newemail;
                docs.work = newwork;
                docs.intro = newintro;
                docs.save();
                const token = await docs.generateToken();
                res.status(201).json({
                    status: true,
                    docs,
                    token
                })
            }
        })
    } catch (error) {
        res.status(404).json({ error: 'Internal server error' });
    }
});

app.delete('/delete-account/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await User.findByIdAndRemove(id).exec();
        res.status(201).json({
            success: true,
            message: 'Account has been deleted'
        });
    } catch (error) {
        console.log(error);
    }
})

app.delete('/delete-story/:id', async (req, res) => {
    const id = req.params.id;
    try {
        await Stories.findByIdAndRemove(id).exec();
        res.status(201).json({
            success: true
        });
    } catch (error) {
        console.log(error);
    }
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
