const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campgrounds");

mongoose.connect("mongodb://localhost:27017/yelp-camp");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6a16de84924f4c61af6567b5",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque ratione dicta!",
      price,
      images: [
        {
          url: "https://res.cloudinary.com/dziodfbei/image/upload/v1780394333/CampExplorer/k8ww9w6i0f4zkvznmkks.jpg",
          filename: "CampExplorer/k8ww9w6i0f4zkvznmkks",
        },
        {
          url: "https://res.cloudinary.com/dziodfbei/image/upload/v1780394334/CampExplorer/m3xsj2r83fty3ya5kick.jpg",
          filename: "CampExplorer/m3xsj2r83fty3ya5kick",
        },
        {
          url: "https://res.cloudinary.com/dziodfbei/image/upload/v1780394333/CampExplorer/guyqycrejhdbffclk6mq.jpg",
          filename: "CampExplorer/guyqycrejhdbffclk6mq",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
