const Listing=require('../models/listing.js');

module.exports.index=async (req,res)=>{
     const allListings=await Listing.find({});
     res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm=(req,res)=>{
     res.render("listings/new.ejs");
};

module.exports.showListing=async(req,res)=>{
     let {id}=req.params;
     const listing=await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
     if(!listing){
          req.flash("error","The list does not exist");
          res.redirect("/listings");
     }
     console.log(listing);
     res.render("listings/show.ejs",{listing});
};

module.exports.createListing=async(req,res,next)=>{
     let url=req.file.path;
     let filename=req.file.filename;
     const newListing=new Listing(req.body.listing);//
     newListing.owner=req.user._id;
     newListing.image={url,filename};
     await newListing.save();
     req.flash("success","new list created");
     res.redirect("/listings");
};

module.exports.renderEditForm=async(req,res)=>{
     let {id}=req.params;
     const listing=await Listing.findById(id);
     if(!listing){
          req.flash("error","The list does not exist");
          res.redirect("/listings");
     }
     let originalImageURL=listing.image.url;
     originalImageURL=originalImageURL.replace("/upload","/upload/w_250");

     res.render("listings/edit.ejs",{listing,originalImageURL});
};

module.exports.updateListing=async(req,res)=>{
     let {id}=req.params;
     let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

     if(typeof req.file!=="undefined"){
          let url=req.file.path;
          let filename=req.file.filename;
          listing.image={url,filename};
          await listing.save();
     }

     req.flash("success","Updated successfully");
     res.redirect(`/listings/${id}`);
};

module.exports.destroyListing=async(req,res)=>{
     let {id}=req.params;
     let deletedList=await Listing.findByIdAndDelete(id);
     console.log(deletedList);
     req.flash("success","List deleted");
     res.redirect("/listings");
};

