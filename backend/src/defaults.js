const artists = [
  ["Queen", "Bohemian Rhapsody", "Una obra maestra para voces valientes y noches memorables.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/22de5a694257f18b23dcee4f66940a051a1a38731e319bf0644f515b388b2023.jpeg"],
  ["ABBA", "Dancing Queen", "Disco luminoso y un estribillo que une toda la sala.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/3bd34a68604f695a29f8e2ccc63ce8146d310c159131682afba4c844e50bb0a2.jpeg"],
  ["Michael Jackson", "Billie Jean", "Pop magnético, ritmo inconfundible y puro espectáculo.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/5c9f032371b19a5bcbcdc6972921f1bf661982388c19081661f498bb104d4d1d.jpeg"],
  ["Luis Fonsi", "Despacito", "El pulso latino que convierte cualquier noche en celebración.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/c31772cd6a29cabe64948c893980de792007a420e49200643d1528cf85b8719a.jpeg"],
  ["Marc Anthony", "Vivir mi vida", "Salsa optimista para cantar con el corazón abierto.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/b3ebe59304a902c4689a7c5c1954d0e24eaa46935211c8e28a68b4edeb304092.jpeg"],
  ["Frank Sinatra", "My Way", "Elegancia clásica y el gran momento de cada crooner.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/48ad62d136bd3ccecd57ad8e1d1acfa6cda3a5b862bb087dbe1d8b9b713b2eee.jpeg"],
  ["Amy Winehouse", "Valerie", "Soul retro, personalidad arrolladora y mucho groove.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/6e13d5d9b20225e18d75167a7b14bbe2f7732a0d25e42ed80b49a5bd4ace2f8e.jpeg"],
  ["The Killers", "Mr. Brightside", "Un himno indie para cantar a pleno pulmón.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/82ba2ffbf1981a2f6d5f7d495b4936f3a4d8b55c22962a8f6d5cb211b3b60553.jpeg"],
  ["Karol G", "Si antes te hubiera conocido", "Pop latino fresco, directo y lleno de color.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/4cca91b21dd1a1c6d0c718bea4413edfc60f7ba30346a400eb565fe3522c8b17.jpeg"],
  ["Luis Miguel", "Ahora te puedes marchar", "Romance, carisma y una melodía imposible de resistir.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/a8516f3eb01b5ce5e7f550fc663f771ac3d0522c0c226aff74b4eb97ba3e62bb.jpeg"],
  ["Jarabe de Palo", "La flaca", "Rock español cálido y una historia que todos recuerdan.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/b1c3d2422d1ca824b2ea1f14e0ce180334df6aefca1f9ba0750f24e390d40c8b.jpeg"],
  ["Hombres G", "Devuélveme a mi chica", "Desenfado ochentero para encender el público.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/de92665659987ca9bc45bf2a37d1681f186a0c3b540b96fec5a16fec39cfebb0.jpeg"],
  ["Juanes", "La camisa negra", "Guitarra latina, actitud y un ritmo instantáneo.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/40aa73723ac6f10d0f34aa304954dd1d773f36fb5e44cd8199291f75889f2ff0.jpeg"],
  ["Los Enanitos Verdes", "Lamento Boliviano", "Rock en español convertido en himno generacional.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/f238afe89b0534553584eca5056b11a8bda36becd9ecceaa2ef266a3b10a4fd3.jpeg"],
  ["Vicente Fernández", "El rey", "La ranchera definitiva para una interpretación con carácter.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/9c9546ffef019d274af7931287ce3ce43fa65e6e7d7c6df7b40b4f7aacbfa2d0.jpeg"],
  ["Rocío Dúrcal", "La gata bajo la lluvia", "Emoción, dramatismo y una voz que atraviesa generaciones.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/cc767ede9547c81e10fdbd071fd6b89148eceb34088e51da346c6a5dad376413.jpeg"],
  ["Raphael (Rafael Martos Sánchez)", "Mi gran noche", "Teatro, intensidad y una noche hecha para brillar.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/fa5fdaf31cdcad4aa91be8e93aa894a0fa4ed5cb385775969524dade155a134b.jpeg"],
  ["La Oreja de Van Gogh", "Rosas", "Pop español delicado con un estribillo inolvidable.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/476dc344c215423f7e91a880516dd176cd0cf142d2bf4bcf560d1158b3daf878.jpeg"],
  ["Miley Cyrus", "Flowers", "Independencia, fuerza y pop contemporáneo irresistible.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/997787c80d36afb909da272ed14ef4b46c57028eeff983562ac2fb37ae3db6c1.jpeg"],
  ["Backstreet Boys", "I Want It That Way", "Armonías pop y nostalgia para cantar en grupo.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/5dc7c6d02e0889f69d52f47f188796160704cba8f56d6ef961a6b26a67d9222f.jpeg"],
  ["The Cranberries", "Zombie", "Rock alternativo intenso para una interpretación poderosa.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/b542dc0002500731648672a62ac3c0c082a491e2d4f3c5b8181d81a26707fb14.jpeg"],
  ["Journey", "Don't Stop Believin'", "El gran crescendo de estadio que nadie deja de cantar.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/430c23cce2cc41670150078dbb2c45da1c3980a8017334a4001fb468d63b20e7.jpeg"],
  ["Enrique Iglesias", "Bailando", "Sensualidad y ritmo latino con espíritu de fiesta.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/7de5a2b929618e84d92f8d794865ff1214c6018d86876f0a3d89fb39646b4acb.jpeg"],
  ["Juan Luis Guerra", "La bilirrubina", "Merengue contagioso y alegría caribeña sin pausa.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/da275f0edc9916e559bcc16a3aa450dfd52a78219b86aa3a612845d97aeb5ae7.jpeg"],
  ["Fito & Fitipaldis", "Soldadito marinero", "Una historia de rock cercana, melódica y muy nuestra.", "https://static.prod-images.emergentagent.com/jobs/2e2c857c-31fd-414f-bda9-a9eeb701c656/images/6b300d9b0f13121d709e13d40eaa12b51ad6346b7f0b4601ee3f251d7b7dc67f.jpeg"],
].map(([artist, song, description, imageUrl], order) => ({
  id: `artist-${order + 1}`, artist, song, description, imageUrl, order,
}));

const galleryUrls = [
  "https://assets.zyrosite.com/A1a5zx5q1vs656b0/494940018_17899109214187768_2982843307330848241_n-mp8J4wMlBeIDavl6.jpg",
  "https://assets.zyrosite.com/A1a5zx5q1vs656b0/504000759_17903335059187768_3539294053734721056_n-YX4xjEZk36U9xqxp.jpg",
  "https://assets.zyrosite.com/A1a5zx5q1vs656b0/499605269_17901328455187768_5427062229389327359_n-mP4M31XR7oHbwyMR.jpg",
  "https://assets.zyrosite.com/A1a5zx5q1vs656b0/498012123_17901015192187768_5385810723641295215_n-YX4xjEZ3bGcwyva0.jpg",
  "https://assets.zyrosite.com/A1a5zx5q1vs656b0/497007118_17900179605187768_831742013906975280_n-AQEZeBXlWDsXa7ZA.jpg",
  "https://assets.zyrosite.com/A1a5zx5q1vs656b0/494554845_17899228116187768_798549039469982133_n-AoPJ4wE9oQu1Z2OG.jpg",
  "https://assets.zyrosite.com/A1a5zx5q1vs656b0/495721113_17899839999187768_1041002484120316392_n-AQEZeBXlWBSxbDa8.jpg",
  "https://assets.zyrosite.com/A1a5zx5q1vs656b0/496850806_17900045703187768_7095872780524014920_n-YrDJ4wLKWOs9XkNO.jpg",
  "https://assets.zyrosite.com/A1a5zx5q1vs656b0/501853603_17902253763187768_5117380634511029661_n-mk3J4wLPZVIwGxKJ.jpg",
];

const settings = {
  id: "main", heroTitle: "El karaoke más exclusivo de Madrid te espera",
  heroDescription: "Brilla como una estrella en Okume", heroVideoUrl: "",
  heroImageUrl: "https://assets.zyrosite.com/A1a5zx5q1vs656b0/504467844_17904103446187768_1912054618185908631_n-AMq8DZXkRKI2NvMG.jpg",
  logoUrl: "https://assets.zyrosite.com/A1a5zx5q1vs656b0/logo_okume_karaoke-removebg-preview-Yyv0x9rkzXcyLOyo.png",
  updatedAt: new Date().toISOString(),
};

module.exports = { artists, galleryUrls, settings };