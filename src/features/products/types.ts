export interface Product {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  category: string
  thumbnail: string
  images: string[]
}

// export interface ApiParams {
//   limit?: number
//   skip?: number
//   search?: string
//   category?: string
//   select?: string[]
// }