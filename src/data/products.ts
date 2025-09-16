import cappuccinoImg from "@/assets/cappuccino.jpg";
import bubbleTeaImg from "@/assets/bubble-tea.jpg";
import icedTeaImg from "@/assets/iced-tea.jpg";
import espressoImg from "@/assets/espresso.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  sizes?: { name: string; price: number }[];
  toppings?: { id: string; name: string; price: number }[];
}

export const products: Product[] = [
  // Cà phê
  {
    id: "cf-001",
    name: "Cappuccino",
    price: 45000,
    image: cappuccinoImg,
    category: "Cà phê",
    sizes: [
      { name: "S", price: 45000 },
      { name: "M", price: 50000 },
      { name: "L", price: 55000 }
    ]
  },
  {
    id: "cf-002",
    name: "Espresso",
    price: 35000,
    image: espressoImg,
    category: "Cà phê",
    sizes: [
      { name: "Single", price: 35000 },
      { name: "Double", price: 50000 }
    ]
  },
  {
    id: "cf-003",
    name: "Americano",
    price: 40000,
    image: cappuccinoImg,
    category: "Cà phê",
    sizes: [
      { name: "S", price: 40000 },
      { name: "M", price: 45000 },
      { name: "L", price: 50000 }
    ]
  },
  {
    id: "cf-004",
    name: "Latte",
    price: 48000,
    image: cappuccinoImg,
    category: "Cà phê",
    sizes: [
      { name: "S", price: 48000 },
      { name: "M", price: 53000 },
      { name: "L", price: 58000 }
    ]
  },
  {
    id: "cf-005",
    name: "Mocha",
    price: 52000,
    image: cappuccinoImg,
    category: "Cà phê",
    sizes: [
      { name: "S", price: 52000 },
      { name: "M", price: 57000 },
      { name: "L", price: 62000 }
    ]
  },
  {
    id: "cf-006",
    name: "Macchiato",
    price: 46000,
    image: cappuccinoImg,
    category: "Cà phê",
    sizes: [
      { name: "S", price: 46000 },
      { name: "M", price: 51000 },
      { name: "L", price: 56000 }
    ]
  },

  // Trà sữa
  {
    id: "ts-001",
    name: "Trà sữa truyền thống",
    price: 35000,
    image: bubbleTeaImg,
    category: "Trà sữa",
    sizes: [
      { name: "M", price: 35000 },
      { name: "L", price: 40000 }
    ],
    toppings: [
      { id: "tp-001", name: "Trân châu đen", price: 5000 },
      { id: "tp-002", name: "Trân châu trắng", price: 5000 },
      { id: "tp-003", name: "Thạch cà phê", price: 7000 },
      { id: "tp-004", name: "Pudding", price: 8000 },
      { id: "tp-005", name: "Kem cheese", price: 10000 }
    ]
  },
  {
    id: "ts-002",
    name: "Trà sữa đường đen",
    price: 38000,
    image: bubbleTeaImg,
    category: "Trà sữa",
    sizes: [
      { name: "M", price: 38000 },
      { name: "L", price: 43000 }
    ],
    toppings: [
      { id: "tp-001", name: "Trân châu đen", price: 5000 },
      { id: "tp-002", name: "Trân châu trắng", price: 5000 },
      { id: "tp-003", name: "Thạch cà phê", price: 7000 },
      { id: "tp-004", name: "Pudding", price: 8000 },
      { id: "tp-005", name: "Kem cheese", price: 10000 }
    ]
  },
  {
    id: "ts-003",
    name: "Trà sữa matcha",
    price: 42000,
    image: bubbleTeaImg,
    category: "Trà sữa",
    sizes: [
      { name: "M", price: 42000 },
      { name: "L", price: 47000 }
    ],
    toppings: [
      { id: "tp-001", name: "Trân châu đen", price: 5000 },
      { id: "tp-002", name: "Trân châu trắng", price: 5000 },
      { id: "tp-003", name: "Thạch cà phê", price: 7000 },
      { id: "tp-004", name: "Pudding", price: 8000 },
      { id: "tp-005", name: "Kem cheese", price: 10000 }
    ]
  },
  {
    id: "ts-004",
    name: "Trà sữa taro",
    price: 40000,
    image: bubbleTeaImg,
    category: "Trà sữa",
    sizes: [
      { name: "M", price: 40000 },
      { name: "L", price: 45000 }
    ],
    toppings: [
      { id: "tp-001", name: "Trân châu đen", price: 5000 },
      { id: "tp-002", name: "Trân châu trắng", price: 5000 },
      { id: "tp-003", name: "Thạch cà phê", price: 7000 },
      { id: "tp-004", name: "Pudding", price: 8000 },
      { id: "tp-005", name: "Kem cheese", price: 10000 }
    ]
  },
  {
    id: "ts-005",
    name: "Trà sữa chocolate",
    price: 41000,
    image: bubbleTeaImg,
    category: "Trà sữa",
    sizes: [
      { name: "M", price: 41000 },
      { name: "L", price: 46000 }
    ],
    toppings: [
      { id: "tp-001", name: "Trân châu đen", price: 5000 },
      { id: "tp-002", name: "Trân châu trắng", price: 5000 },
      { id: "tp-003", name: "Thạch cà phê", price: 7000 },
      { id: "tp-004", name: "Pudding", price: 8000 },
      { id: "tp-005", name: "Kem cheese", price: 10000 }
    ]
  },
  {
    id: "ts-006",
    name: "Trà sữa dâu",
    price: 39000,
    image: bubbleTeaImg,
    category: "Trà sữa",
    sizes: [
      { name: "M", price: 39000 },
      { name: "L", price: 44000 }
    ],
    toppings: [
      { id: "tp-001", name: "Trân châu đen", price: 5000 },
      { id: "tp-002", name: "Trân châu trắng", price: 5000 },
      { id: "tp-003", name: "Thạch cà phê", price: 7000 },
      { id: "tp-004", name: "Pudding", price: 8000 },
      { id: "tp-005", name: "Kem cheese", price: 10000 }
    ]
  },

  // Nước giải khát
  {
    id: "nk-001",
    name: "Trà chanh",
    price: 25000,
    image: icedTeaImg,
    category: "Nước giải khát",
    sizes: [
      { name: "M", price: 25000 },
      { name: "L", price: 30000 }
    ]
  },
  {
    id: "nk-002",
    name: "Trà đào cam sả",
    price: 32000,
    image: icedTeaImg,
    category: "Nước giải khát",
    sizes: [
      { name: "M", price: 32000 },
      { name: "L", price: 37000 }
    ]
  },
  {
    id: "nk-003",
    name: "Nước cam tươi",
    price: 28000,
    image: icedTeaImg,
    category: "Nước giải khát",
    sizes: [
      { name: "M", price: 28000 },
      { name: "L", price: 33000 }
    ]
  },
  {
    id: "nk-004",
    name: "Sinh tố bơ",
    price: 35000,
    image: icedTeaImg,
    category: "Nước giải khát",
    sizes: [
      { name: "M", price: 35000 },
      { name: "L", price: 40000 }
    ]
  },
  {
    id: "nk-005",
    name: "Nước dừa tươi",
    price: 22000,
    image: icedTeaImg,
    category: "Nước giải khát",
    sizes: [
      { name: "M", price: 22000 },
      { name: "L", price: 27000 }
    ]
  },
  {
    id: "nk-006",
    name: "Trà vải",
    price: 26000,
    image: icedTeaImg,
    category: "Nước giải khát",
    sizes: [
      { name: "M", price: 26000 },
      { name: "L", price: 31000 }
    ]
  }
];

export const categories = ["Tất cả", "Cà phê", "Trà sữa", "Nước giải khát"];