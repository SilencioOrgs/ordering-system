export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isBestSeller?: boolean;
    tags?: string[];
};

export const products: Product[] = [
    {
        id: "p1",
        name: "Classic Biko",
        description: "Sweet sticky rice topped with rich latik.",
        price: 150,
        image: "/images/559914604_1254274410053071_6617840845640758432_n.jpg",
        category: "Kakanin",
        isBestSeller: true,
        tags: ["🥥 Coconut", "🍚 Sticky Rice"]
    },
    {
        id: "p2",
        name: "Special Sapin-Sapin",
        description: "Layered glutinous rice and coconut dessert with vibrant colors.",
        price: 180,
        image: "/images/561051521_1252374910243021_2082468191461832098_n.jpg",
        category: "Kakanin",
        isBestSeller: true,
        tags: ["🌴 Ube", "🥥 Coconut"]
    },
    {
        id: "p3",
        name: "Puto Bumbong",
        description: "Purple yam sticky rice steamed in bamboo tubes, served with butter and muscovado.",
        price: 120,
        image: "/images/567960899_1262727009207811_5784546056374810707_n.jpg",
        category: "Kakanin",
        isBestSeller: true,
        tags: ["💜 Purple Yam", "🧈 Butter"]
    },
    {
        id: "p4",
        name: "Suman sa Lihiya",
        description: "Lye-treated glutinous rice wrapped in banana leaves, paired with sweet coconut caramel.",
        price: 90,
        image: "/images/568023794_1262727045874474_6661669920084749223_n.jpg",
        category: "Suman",
        tags: ["🍌 Banana Leaf", "🍬 Caramel"]
    },
    {
        id: "p5",
        name: "Suman Moron",
        description: "Chocolate and vanilla stick rice rolls from Leyte.",
        price: 110,
        image: "/images/573533430_1273281738152338_6397587221495797175_n.jpg",
        category: "Suman",
        tags: ["🍫 Chocolate", "🍦 Vanilla"]
    },
    {
        id: "p6",
        name: "Kutsinta",
        description: "Steamed slightly chewy brown rice cake served with freshly grated coconut.",
        price: 80,
        image: "/images/573619162_1273281571485688_7251802702286237193_n.jpg",
        category: "Kakanin",
        tags: ["🌾 Lye", "🥥 Coconut"]
    },
    {
        id: "p7",
        name: "Party Tray - Biko",
        description: "A large bilao of our classic biko, perfect for family gatherings.",
        price: 850,
        image: "/images/574258687_1273281701485675_8304845403151867828_n.jpg",
        category: "Party Trays",
        tags: ["👨‍👩‍👧‍👦 Family Size", "🎉 Party"]
    },
    {
        id: "p8",
        name: "Cassava Cake",
        description: "Baked grated cassava with coconut milk and a creamy cheese custard layer.",
        price: 220,
        image: "/images/575733000_1276911361122709_2125848877179651595_n.jpg",
        category: "Kakanin",
        isBestSeller: true,
        tags: ["🧀 Cheese", "🥥 Coconut Milk"]
    }
];

export const categories = ["All", "Kakanin", "Suman", "Party Trays"];
