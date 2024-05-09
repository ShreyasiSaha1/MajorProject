const express=require("express");
const router=express.Router({mergeParams:true});
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Review=require("../models/review.js");
const Listing=require("../models/listing.js");
const {validateReview, isLoggedin, isReviewAuthor}=require("../middleware.js");

const reviewController=require("../controllers/reviews.js");

//Reviews
//Post Review Route
router.post("/",isLoggedin,validateReview,wrapAsync(reviewController.createReview));
 
 //Delete Review Route
 router.delete("/:reviewId",isLoggedin,isReviewAuthor,wrapAsync(reviewController.destroyReview));
 
 module.exports=router;