export type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isBestSeller?: boolean;
};

export const products: Product[] = [
    {
        id: "p1",
        name: "Classic Biko",
        description: "Sweet sticky rice topped with rich latik.",
        price: 150,
        image: "https://images.unsplash.com/photo-1541580621-07f3dcfa89fd?q=80&w=800&auto=format&fit=crop",
        category: "Kakanin",
        isBestSeller: true,
    },
    {
        id: "p2",
        name: "Special Sapin-Sapin",
        description: "Layered glutinous rice and coconut dessert with vibrant colors.",
        price: 180,
        image: "https://images.unsplash.com/photo-1551879400-111a9087cd86?q=80&w=800&auto=format&fit=crop",
        category: "Kakanin",
        isBestSeller: true,
    },
    {
        id: "p3",
        name: "Puto Bumbong",
        description: "Purple yam sticky rice steamed in bamboo tubes, served with butter and muscovado.",
        price: 120,
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop",
        category: "Kakanin",
        isBestSeller: true,
    },
    {
        id: "p4",
        name: "Suman sa Lihiya",
        description: "Lye-treated glutinous rice wrapped in banana leaves, paired with sweet coconut caramel.",
        price: 90,
        image: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?q=80&w=800&auto=format&fit=crop",
        category: "Suman",
    },
    {
        id: "p5",
        name: "Suman Moron",
        description: "Chocolate and vanilla stick rice rolls from Leyte.",
        price: 110,
        image: "https://images.unsplash.com/photo-1605807646983-377bc5a76493?q=80&w=800&auto=format&fit=crop",
        category: "Suman",
    },
    {
        id: "p6",
        name: "Kutsinta",
        description: "Steamed slightly chewy brown rice cake served with freshly grated coconut.",
        price: 80,
        image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=800&auto=format&fit=crop",
        category: "Kakanin",
    },
    {
        id: "p7",
        name: "Party Tray - Biko",
        description: "A large bilao of our classic biko, perfect for family gatherings.",
        price: 850,
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800&auto=format&fit=crop",
        category: "Party Trays",
    },
    {
        id: "p8",
        name: "Cassava Cake",
        description: "Baked grated cassava with coconut milk and a creamy cheese custard layer.",
        price: 220,
        image: "https://images.unsplash.com/photo-1587241321921-91a834d6d191?q=80&w=800&auto=format&fit=crop",
        category: "Kakanin",
        isBestSeller: true,
    }
];

export const categories = ["All", "Kakanin", "Suman", "Party Trays"];
