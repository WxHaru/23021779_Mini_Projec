const express = require('express');
const mysql = require('mysql2');
const app = express();
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // Directory to save uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Create MySQL connection

const connection = mysql.createConnection({
    host: 'sql.freedb.tech',
    user: 'freedb_Haruka Nanase',
    password: 'K5QbkYp32!8u5#e',
    database: 'freedb_Twice Fan Membership'
});
 
connection.connect((err) => {
    if (err) {
       console.error('Error connecting to MySQL:', err);
    return;
}
    console.log('Connected to MySQL database');
});

app.set('view engine', 'ejs');

const port = 3006;

// enable static files
app.use(express.static('public'));

app.use(express.urlencoded({
    extended: false
}));

// enable static files
app.use(express.static('public'));

// Define routes
app.get('/md', function(req,res) {
    const sql = 'SELECT * FROM twicefanmembership';
    //Fetch data from MySQL
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving memberships');
        }
        res.render('md',{ twicefanmembership: results});
    });
});
app.get('/membership/:id',(req,res) => {
    // Extract the membership ID from the request parameters
    const memberId = req.params.id;
    const sql = 'SELECT * FROM twicefanmembership WHERE memberId = ?';
    //Fetch data from MySQL
    connection.query( sql, [memberId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving memberships');
        }
        if (results.length >0) {
            res.render('membership',{ membership: results[0] });
        } else {
            res.status(404).send('membership not found');
        }   
    });
});

app.get('/addMembership', (req, res) => {
    res.render('addMembership');
})

app.post('/addMembership', upload.single('memberimage'), (req, res) => {
    // Extract membership data from the request body
    const { membername, location, favouriteidol, favouritesong, password } = req.body;
    let memberimage;
    if (req.file) {
        memberimage = req.file.filename; // Save only the filename
    } else {
        memberimage = null;
    }

    const sql = 'INSERT INTO twicefanmembership (membername, memberimage, location, favouriteidol, favouritesong, password) VALUES (?, ?, ?, ?, ?, ?)';
    // Insert the new membership into the database
    connection.query( sql, [membername, memberimage, location, favouriteidol, favouritesong, password], (error, results) => {
        if (error) {
            console.error('Error adding membership:', error);
            res.status(500).send('Error adding memberships');
    
        } else {
            res.redirect('/md');
        }   
    });
});

app.get('/updateMembership/:id', (req, res) => {
    const memberId = req.params.id;
    const sql = 'SELECT * FROM twicefanmembership WHERE memberId = ?';
    // Fetch data from MYSQL based on the member ID
    connection.query( sql, [memberId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving member by ID');
        }
        // Check if any member with the given ID was found
        if (results.length > 0) {
            // Render HTML page with the member data
            res.render('updateMembership', { membership: results[0] });
        } else {
            // If no membership with the given ID was found, render a 404 page or handle it accordingly
            res.status(404).send('Membership not found');
        }
    });
});

app.post('/updateMembership/:id', upload.single('memberimage'), (req,res) => {
    const memberId = req.params.id;
    // Extract membership data from the request body
    const { membername, location, favouriteidol, favouritesong } = req.body;
    let memberimage = req.body.currentImage; // retrieve current image filename
    if (req.file) { // if new image is uploaded 
        memberimage = req.file.filename; // set image to be new image filename
    } 

    console.log('Updating membership:', { memberId, membername, memberimage, location, favouriteidol, favouritesong });
    
    const sql = 'UPDATE twicefanmembership SET membername = ?, memberimage = ?, location = ?, favouriteidol = ?, favouritesong = ? WHERE memberId = ?';
    // Insert the new membership into the database
    connection.query( sql, [membername, memberimage, location, favouriteidol, favouritesong, memberId],(error, results) => {
        if (error) {
            // Handle any error that occurs during database operation
            console.error('Error adding membership:', error);
            res.status(500).send('Error adding memberships');
        } else {
            // Send a success response
            res.redirect('/md');
        }   
    });
});

app.get('/deleteMembership/:id', (req, res) => {
    const memberId = req.params.id;
    const sql = 'DELETE FROM twicefanmembership WHERE memberId = ?';
    // Fetch data from MYSQL based on the member ID
    connection.query( sql, [memberId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error("Error deleting membership:", error);
            res.status(500).send('Error deleting membership');
        } else {
            // Send a success response
            res.redirect('/md');
        }
    });
});

// Route to retrieve and display all idols
app.get('/about', function(req,res) {
    const sql = 'SELECT * FROM idoldetails';
    //Fetch data from MySQL
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving idoldetails');
        }
        res.render('about',{ idoldetails: results});
    });
});

// Route to get a specific idol by ID
app.get('/idolInfos/:id',(req,res) => {
    // Extract the idol ID from the request parameters
    const idolId = req.params.id;
    const sql = 'SELECT * FROM idoldetails WHERE idolId = ?';
    //Fetch data from MySQL
    connection.query( sql, [idolId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving idoldetails');
        }
        if (results.length >0) {
            res.render('idolInfos',{ idoldetails: idol });
        } else {
            res.status(404).send('idol not found');
        }   
    });
});

app.post('/about/:id', upload.array('idolimage'), (req, res) => {
    // Extract idol data from the request body
    const { idolname, position } = req.body;
    let idolimage;
    if (req.file) {
        idolimage =  req.files.map(file => file.filename); // Save only the filename
    } else {
        idolimage = null;
    }

    const sql = 'INSERT INTO idoldetails (idolimage, idolname, position) VALUES (?, ?, ?)';
    // Insert the new idol into the database
    connection.query( sql, [idolimage, idolname, position], (error, results) => {
        if (error) {
            console.error('Error adding idolInfos:', error);
            res.status(500).send('Error adding idols');
    
        } else {
            res.redirect('/about');
        }   
    });
});
  
let twicecontacts = [
    { contactinfoname: 'For any inquiries or feedback, please feel free to contact us.', contactinfoname: '@ +65 88384587', contactinfoname: 'https://Twice.com.sg' }
];
  
app.get('/', function(req, res) {
    res.render('index', { twicecontacts });
});
  
app.get('/twicecontacts', function(req, res) {
    if (twicecontacts) {
        res.render('contactinfo', { twicecontacts })
    } 
});
  
app.get('/contact', function(req, res) {
    res.render('contact');
});
  
app.post('/twicecontacts', function(req, res) {
    const { contactinfoname } = req.body;
    res.redirect('/');
});

// Route to retrieve and display all albums
app.get('/kalbum', function(req,res) {
    const sql = 'SELECT * FROM kalbumdetails';
    //Fetch data from MySQL
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving kalbumdetails');
        }
        res.render('kalbum',{ kalbumdetails: results});
    });
});

// Route to get a specific album by ID
app.get('/kalbumInfos/:id',(req,res) => {
    // Extract the album ID from the request parameters
    const kalbumId = req.params.id;
    const sql = 'SELECT * FROM kalbumdetails WHERE kalbumId = ?';
    //Fetch data from MySQL
    connection.query( sql, [kalbumId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving kalbumdetails');
        }
        if (results.length >0) {
            res.render('kalbumInfos',{ kalbumdetails: idol });
        } else {
            res.status(404).send('album not found');
        }   
    });
});

app.post('/kalbum/:id', upload.array('kalbumimage'), (req, res) => {
    // Extract album data from the request body
    const { kalbumname, ksonglist } = req.body;
    let kalbumimage;
    if (req.file) {
        kalbumimage =  req.files.map(file => file.filename); // Save only the filename
    } else {
        kalbumimage = null;
    }

    const sql = 'INSERT INTO kalbumdetails (kalbumimage, kalbumname, ksonglist) VALUES (?, ?, ?)';
    // Insert the new album into the database
    connection.query( sql, [kalbumimage, kalbumname, ksonglist], (error, results) => {
        if (error) {
            console.error('Error adding kalbumInfos:', error);
            res.status(500).send('Error adding albums');
    
        } else {
            res.redirect('/kalbum');
        }   
    });
});

// Route to retrieve and display all albums
app.get('/jalbum', function(req,res) {
    const sql = 'SELECT * FROM jalbumdetails';
    //Fetch data from MySQL
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving jalbumdetails');
        }
        res.render('jalbum',{ jalbumdetails: results});
    });
});

// Route to get a specific album by ID
app.get('/jalbumInfos/:id',(req,res) => {
    // Extract the album ID from the request parameters
    const jalbumId = req.params.id;
    const sql = 'SELECT * FROM jalbumdetails WHERE jalbumId = ?';
    //Fetch data from MySQL
    connection.query( sql, [jalbumId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving jalbumdetails');
        }
        if (results.length >0) {
            res.render('jalbumInfos',{ jalbumdetails: idol });
        } else {
            res.status(404).send('album not found');
        }   
    });
});

app.post('/jalbum/:id', upload.array('kalbumimage'), (req, res) => {
    // Extract album data from the request body
    const { jalbumname, jsonglist } = req.body;
    let jalbumimage;
    if (req.file) {
        jalbumimage =  req.files.map(file => file.filename); // Save only the filename
    } else {
        jalbumimage = null;
    }

    const sql = 'INSERT INTO jalbumdetails (jalbumimage, jalbumname, jsonglist) VALUES (?, ?, ?)';
    // Insert the new album into the database
    connection.query( sql, [jalbumimage, jalbumname, jsonglist], (error, results) => {
        if (error) {
            console.error('Error adding jalbumInfos:', error);
            res.status(500).send('Error adding albums');
    
        } else {
            res.redirect('/jalbum');
        }   
    });
});

app.get('/vd', function(req,res) {
    const sql = 'SELECT * FROM votingawards';
    //Fetch data from MySQL
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving votings');
        } else {
            res.render('vd', { votingawards: results });
        }
    });
});

app.get('/voting/:id',(req,res) => {
    // Extract the voting ID from the request parameters
    const votingId = req.params.id;
    const sql = 'SELECT * FROM votingawards WHERE votingId = ?';
    //Fetch data from MySQL
    connection.query( sql, [votingId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error Retrieving votings');
        }
        if (results.length >0) {
            res.render('voting', { voting: results[0] });
        } else {
            res.status(404).send('voting not found');
        }   
    });
});

app.get('/addVoting', (req, res) => {
    res.render('addVoting');
})

app.post('/addVoting', (req, res) => {
    // Extract voting data from the request body
    const { year, soty, aoty, rkgaoty, bsaoty, bfkgoty, bmkgoty } = req.body;

    const sql = 'INSERT INTO votingawards (year, soty, aoty, rkgaoty, bsaoty, bfkgoty, bmkgoty) VALUES (?, ?, ?, ?, ?, ?, ?)';
    // Insert the new voting into the database
    connection.query( sql, [year, soty, aoty, rkgaoty, bsaoty, bfkgoty, bmkgoty], (error, results) => {
        if (error) {
            console.error('Error adding voting:', error);
            res.status(500).send('Error adding votings');
    
        } else {
            res.redirect('/vd');
        }   
    });
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    const { membername, password } = req.body;

    // Check if the user already exists
    const CHECK_member_QUERY = 'SELECT * FROM twicefanmembership WHERE membername = ?';

    connection.query(CHECK_member_QUERY, [membername], (error, results) => {
        if (error) {
            console.error('Error checking for existing member:', error);
            return res.status(500).send('Error checking membership');
        }

        if (results.length > 0) {
            return res.status(400).render('signup', { error: 'membername already exists' });
        }

        // Insert the new user into the database
        const INSERT_member_QUERY = 'INSERT INTO twicefanmembership (membername, password) VALUES (?, ?)';

        connection.query(INSERT_member_QUERY, [membername, password], (error, results) => {
            if (error) {
                console.error('Error adding member:', error);
                return res.status(500).send('Error adding membership');
            }

            console.log('Member has signed up successfully');
            const memberId = results.insertId;

            res.cookie('memberId', memberId, { httpOnly: true });

            // Redirect to the profile page or any other page after signup
            res.redirect(`/`);
        });
    });
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { membername, password } = req.body;

    const SELECT_member_QUERY = 'SELECT * FROM twicefanmembership WHERE membername = ? AND password = ?';

    connection.query(SELECT_member_QUERY, [membername, password], (error, results) => {
        if (error) {
            console.error('Error retrieving membership:', error);
            return res.status(500).send('Error retrieving membership');
        }

        if (results.length === 0) {
            return res.status(401).render('login', { error: 'membername or password incorrect' });
        }

        console.log('Member has logged in successfully');
        const memberId = results[0].memberId;

        res.cookie('memberId', memberId, { httpOnly: true });

        // Redirecting to the profile page or any other page after login
        res.redirect(`/`);
    });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});