const mongoose = require('mongoose');
const {Schema} = mongoose

const userSchema = new Schema({
    neme: {
        type: String, 
        maxlength: 30,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: true,
        //유일값
        unique: true,
    },
    password: {
        type: String,
        //공백제거
        trim: true,
        //필수값
        required: true,
    },
    age:{
        type: Number,
        min: 18,
        max: 50,
    },
    role: {
        type: Number,
        default: 0,
    },
    image: String,
    token: {
        type: String,
    },
    tokenExp: {
        type: Number,
    }
}, {
    timestamps: true
})

// 다른 곳에서 사용 가능하도록 모델을 expoert 해줌
module.exports = mongoose.model('User', userSchema)