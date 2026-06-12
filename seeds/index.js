require("dotenv").config();
const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campgrounds");

const db_uri = process.env.DB_URI || "mongodb://127.0.0.1:27017/yelp-camp";
mongoose.connect(db_uri);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const campingImages = [
  "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1537905569824-f89f14cceb68?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1525811902-f2342640856e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80",
];

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 20; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;

    const randomImages = [];
    const numImages = Math.floor(Math.random() * 2) + 2;

    for (let j = 0; j < numImages; j++) {
      const imgUrl = sample(campingImages);
      randomImages.push({
        url: imgUrl,
        filename: `CampExplorer/seed_${i}_${j}`,
      });
    }

    const camp = new Campground({
      author: "6a2b02020a989297a1efa6f4",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque ratione dicta!",
      price,
      images: randomImages,
    });
    await camp.save();
  }
  console.log("Successfully seeded 20 campgrounds!");
};

seedDB().then(() => {
  mongoose.connection.close();
});
