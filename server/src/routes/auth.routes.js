import express from "express";

const router = express.Router();

router.post('/signup',(req,res) => {
    res.send('Post /api/auth/signup response');
});

router.post('/signin',(req,res) => {
    res.send('Post /api/auth/signin response');
});

router.post('/signout',(req,res) => {
    res.send('Post /api/auth/signout response');
});

export default router;