var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware/index.js");
//=================
//campground Routes
//=================

//INDEX -- Display a list of all campgrounds        
router.get("/", function(req,res){
        //Get all campgrounds from DB
        Campground.find({}, function(err, allcampgrounds){
           if(err){
               console.log(err);
           } else{
               res.render("campgrounds/index", {campgrounds: allcampgrounds, currentUser: req.user});
           }
        });
        //res.render("campgrounds", {campgrounds:campgrounds});
});

//CREATE -- Add new campgrounds to DB
router.post("/", middleware.isLoggedIn, function(req,res){
   //get data from form and add to campgrounds array
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   }
   var newCampground = {name:name, image:image, description: desc, author:author}
   //Create a new campground and save to DB
   Campground.create(newCampground, function(err, newlyCreated){
      if(err){
          console.log(err);
      } else{
          //redirect back to campgrounds page
          res.redirect("/campgrounds");
      }
   });
   
});

//NEW -- Displays form to make a new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

//SHOW -- Display single information
router.get("/:id", function(req,res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
        if(err){
            console.log(err);
        }else{
            //render show page
            res.render("campgrounds/show", {campground: campground});
        }
    });
});

//Edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground}); 
    });
});

//Update campground route
router.put("/:id", middleware.checkCampgroundOwnership, function(req,res){
    //find and update the correct campground
    
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
        if(err){
            res.redirect("/campgrounds");
        } else{
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
    //redirect somewhere(show case)
});

//Destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect("/campgrounds");
       } else {
           res.redirect("/campgrounds");
       } 
    });
});

module.exports = router;