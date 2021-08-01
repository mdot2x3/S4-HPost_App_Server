const express = require("express");
const router = express.Router();
const { Posts, Likes } = require("../models");

//Get gets data from DB
//Post posts data to DB

const { validateToken } = require("../middleware/AuthMiddleware");

//Gets a list of all of the posts, also query list of all posts user has like before
router.get("/", validateToken, async (req, res) => {
  const listOfPosts = await Posts.findAll({ include: [Likes] });
  const likedPosts = await Likes.findAll({ where: { UserId: req.user.id } });
  res.json({ listOfPosts: listOfPosts, likedPosts: likedPosts });
});

//Gets a list of posts by id
router.get("/byId/:id", async (req, res) => {
  const id = req.params.id;
  const post = await Posts.findByPk(id);
  res.json(post);
});

//Gets all the posts that exist for an id
router.get("/byuserId/:id", async (req, res) => {
  const id = req.params.id;
  //grab all posts in post table(db), where userid = id passing in params
  const listOfPosts = await Posts.findAll({
    where: { UserId: id },
    include: [Likes],
  });
  res.json(listOfPosts);
});

//Create a post and add it to our db
router.post("/", validateToken, async (req, res) => {
  const post = req.body; //grab object sent to frontend(contains postBody, postText, title)
  post.username = req.user.username; //adds a new field username, set it equal to user who is logged in
  post.UserId = req.user.id;
  await Posts.create(post);
  res.json(post);
});

//Update post title
router.put("/title", validateToken, async (req, res) => {
  const { newTitle, id } = req.body;
  //inside update(first item is whatever fields you want to update,
  //second item you identify which role or post you are pointing to)
  await Posts.update({ title: newTitle }, { where: { id: id } });
  res.json(newTitle);
});

//Update post text
router.put("/postText", validateToken, async (req, res) => {
  const { newText, id } = req.body;
  await Posts.update({ postText: newText }, { where: { id: id } });
  res.json(newText);
});

router.delete("/:postId", validateToken, async (req, res) => {
  const postId = req.params.postId;
  await Posts.destroy({
    where: {
      id: postId,
    },
  });

  res.json("DELETED SUCCESSFULLY");
});

module.exports = router;
