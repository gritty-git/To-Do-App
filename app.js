//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://MSoumya:MSoumya@cluster0.iqnpm.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const t1 = new Item({
  name: "Code Site"
});
const t2 = new Item({
  name: "Discuss Marketing"
});
const t3 = new Item({
  name: "Meeting"
});

const defaultItems = [t1, t2, t3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.get("/", function(req, res) {
  Item.find(function(err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("done");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: items
      });
    }
  });


});


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();

    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }



});

app.post("/delete", function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.deleteOne({ _id: checkedItemId }, function (err) {
      if(err) console.log(err);
      else
      console.log("Successful deletion");

    res.redirect("/");
  });
}else{
  List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}},function(err, foundList){
  if(!err){
    res.redirect("/" + listName);
  }});
}
  });



app.get("/:userChoice", function(req, res) {
  const userChoice = _.capitalize(req.params.userChoice);

  List.findOne({name: userChoice},function(err,foundList){
    if(!err){
      if(!foundList){
        //create new list
        const list = new List({
          name: userChoice,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + userChoice);
      }else{
        //show existing list
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });



});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
