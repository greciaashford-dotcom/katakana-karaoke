from .common import now_iso

COVER_BASE = "https://static.prod-images.emergentagent.com/jobs/d472ac71-4a27-41a3-8e17-34864d924e43/images/"

# nombre visible, clave del catálogo (artistKey), canción destacada, descripción, portada
_ARTIST_ROWS = [
    ["Queen", "queen", "Bohemian Rhapsody", "Ópera rock para voces valientes y coros de toda la sala.", "47d7c123ed8baf0b5380c5ed1c98d46acccdb29fcaff148605c8008715123276"],
    ["Rocío Jurado", "rocio jurado", "Como una ola", "Copla con poderío: la canción que se canta de pie.", "a134959905a1e3b3940e4b94d7a9789c7d742edbaad4649a353de2d425d284c5"],
    ["ABBA", "abba", "Dancing Queen", "Disco luminoso y un estribillo que une a todas las mesas.", "1473a8a5cac84464ad30e45a26b8389af5182a346d207ab2335d8015ab2364ed"],
    ["Luis Miguel", "luis miguel", "Ahora te puedes marchar", "Romance, carisma y el bolero pop más elegante.", "0a2051abefa6441a87209c0afa020586d39c5bc3168e8deda760862987342c43"],
    ["Michael Jackson", "michael jackson", "Billie Jean", "Ritmo inconfundible y puro espectáculo sobre el escenario.", "0949a454057474288fc33b3c58aaa637b1d79234fbacda1034768747e926468f"],
    ["Raphael", "raphael", "Mi gran noche", "Teatro, intensidad y una noche hecha para brillar.", "efd30b39c071358119a8d08e82ff590ed198e58ee7ee56183d05afa6b6892a9c"],
    ["Shakira", "shakira", "Estoy aquí", "Pop latino con garra para soltarse la melena.", "65f3b3ea5f2a961a481d47e5ed3171ab7377eff000be7258af3ad564f3742075"],
    ["Camilo Sesto", "camilo sesto", "Vivir así es morir de amor", "Baladas eternas para dejarse la voz con emoción.", "4a8354d41aa6838a555377aa633770571db15f9150766ed61b5c29ce88710b58"],
    ["The Beatles", "the beatles", "Let It Be", "Melodías universales que conocen todas las generaciones.", "002b4bcb551b22fce95ec989380203a682834277743b796225eba4ba9af7dc0d"],
    ["Mecano", "mecano", "Hijo de la luna", "El pop español que todo el mundo sabe de memoria.", "93d6e6a291ba9d2c86da85266e63a51033d6a78f93f1448ed733052215ce80a7"],
    ["Whitney Houston", "whitney houston", "I Will Always Love You", "El gran reto vocal para quien va a por nota.", "d2df693aa33b9b55d6624d41c99cad0780596aa1a8f6a2bd74d0cfa9cc10c76f"],
    ["Alejandro Sanz", "alejandro sanz", "Corazón partío", "Rumba-pop con duende para cantar a dúo.", "d418a5c873f24093fe46a47dff59ae2ec12800bbf64d0fd9acc5177820df2d7e"],
    ["Julio Iglesias", "julio iglesias", "Me olvidé de vivir", "Un clásico romántico con el encanto de siempre.", "b0e62ad6473ba2ab6086cfbdff6c0ae2881f3a88b1cf1a26d0b42f6a5b4f0818"],
    ["Madonna", "madonna", "Like a Prayer", "Himnos pop para bailar mientras cantas.", "c6626318f63fee7cf2dfccae493951fcc42b3e422534b206d681ef6605fb7cac"],
    ["Rocío Dúrcal", "rocio durcal", "La gata bajo la lluvia", "Ranchera con sentimiento que atraviesa generaciones.", "379db406c6faea3d2e6871043007f7463a531a2ef3bce8739c839eece8f595e4"],
    ["Elvis Presley", "elvis presley", "Suspicious Minds", "Rock and roll con tupé y mucho swing.", "5cb59c67d7b72a8f38212b68650b411c7c09c5ee8cd75bf49407e466c0397585"],
    ["Joaquín Sabina", "joaquin sabina", "19 días y 500 noches", "Poesía canalla para cantar a coro en la barra.", "447598b2a1c39494012a957acd99d44290600bf05ef154d070fa31015ee44c26"],
    ["Marc Anthony", "marc anthony", "Vivir mi vida", "Salsa optimista para cantar con el corazón abierto.", "ae492def5f7aa2e2ea44762e27dea8385ac0bef98c30c42b818ddb4841b0e5ec"],
    ["Karol G", "karol g", "Tusa", "Reguetón y desamor para la nueva generación del micro.", "424c5d1e5f68b61faaa062d35b7035b0f7ac27800f906efe627bc67bb02753a9"],
    ["Bon Jovi", "bon jovi", "Livin' on a Prayer", "El himno rockero que levanta a toda la sala.", "5d9570b5a2162a1ef05ec3635402c25aa3d9d99fca3b0751f86ff3360d3d5a9e"],
    ["La Oreja de Van Gogh", "la oreja de van gogh", "Rosas", "Pop delicado con un estribillo inolvidable.", "4ec7aac3da8eccb578bbfa269bf998e4367f173aacbc9da3e25918f9cf0d285a"],
    ["Céline Dion", "celine dion", "My Heart Will Go On", "Una balada épica para el momento más intenso.", "f0063bf67109f5875bd14c44adc5830f7676af65157b75299a6e3d186d7ca2b6"],
    ["Estopa", "estopa", "Como Camarón", "Rumba con desparpajo y muy buen rollo.", "ff4c2a23e8e83c66dc2afe6ec050501fed396bc55237c4fc303dccc1279f1744"],
    ["Nino Bravo", "nino bravo", "Libre", "Una voz de leyenda y un canto a la libertad.", "ead0f9f60f94353965e098d75bdd47d962ba8d07c1ef8eef10c9a811719303f4"],
    ["Laura Pausini", "laura pausini", "En ausencia de ti", "Baladas en español e italiano con mucho corazón.", "6574bf75223946f144066fa9ae258760fb9c9e02d4dd63ffef1d68f6bef0f664"],
]

ARTISTS = [
    {"id": f"artist-{index + 1}", "artist": artist, "catalogArtist": key, "song": song, "description": description, "imageUrl": f"{COVER_BASE}{cover}.jpeg", "order": index}
    for index, (artist, key, song, description, cover) in enumerate(_ARTIST_ROWS)
]

GALLERY = [
    ("/images/evento-cumpleanos.jpg", "Grupo de amigas celebrando un cumpleaños en el escenario de Katakana"),
    ("/images/hero-escenario.jpg", "Cantante interpretando un tema en el escenario de Katakana"),
    ("/images/evento-grupo.jpg", "Grupo de amigos cantando juntos frente al logo de Katakana"),
    ("/images/local-barra.jpg", "Barra de Katakana iluminada con luces de neón azules y moradas"),
    ("/images/evento-despedida.jpg", "Cuatro amigas cantando con micrófonos en el escenario"),
    ("/images/evento-baile.jpg", "Público bailando en la pista junto al escenario"),
    ("/images/local-salon.jpg", "Salón interior con butacas rojas y escenario de Katakana"),
    ("/images/halloween-disfraces.jpg", "Clientes disfrazados cantando en la fiesta de Halloween"),
    ("/images/evento-empresa.jpg", "Sala llena durante una noche de karaoke en grupo"),
]

DEFAULT_LOGO = "/brand/katakana-logo.png"

# Día ISO: 1 = lunes … 7 = domingo
DEFAULT_HOURS = [
    {"day": 1, "label": "Lunes", "open": "20:00", "close": "03:30", "closed": False},
    {"day": 2, "label": "Martes", "open": "20:00", "close": "03:30", "closed": False},
    {"day": 3, "label": "Miércoles", "open": "20:00", "close": "03:30", "closed": False},
    {"day": 4, "label": "Jueves", "open": "20:00", "close": "03:30", "closed": False},
    {"day": 5, "label": "Viernes", "open": "19:00", "close": "04:00", "closed": False},
    {"day": 6, "label": "Sábado", "open": "19:00", "close": "04:00", "closed": False},
    {"day": 7, "label": "Domingo", "open": "", "close": "", "closed": True},
]


def default_settings() -> dict:
    return {
        "id": "main",
        "heroTitle": "Karaoke en Madrid para cantar, celebrar y disfrutar",
        "heroDescription": "En Avenida de América, con repertorio multilingüe, sonido digital y tres ambientes para vivir la noche a tu manera.",
        "heroVideoUrl": "", "heroImageUrl": "/images/hero-escenario.jpg", "logoUrl": DEFAULT_LOGO,
        "hours": [dict(h) for h in DEFAULT_HOURS],
        "hoursNote": "Vísperas de festivo: de 19:00 a 04:00.",
        "reservationHours": "Atención a reservas de lunes a sábado, de 20:00 a 03:00.",
        "notice": "",
        "googleRating": "", "googleReviewCount": "",
        "googleReviewsUrl": "https://www.google.com/maps/search/?api=1&query=Karaoke+Katakana+Avenida+de+Am%C3%A9rica+22+Madrid",
        "updatedAt": now_iso(),
    }
