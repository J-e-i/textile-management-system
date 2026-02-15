import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, Loader2 } from "lucide-react";
import { getProducts } from "@/lib/business";
import type { Product } from "@/lib/business";
import { useAuth } from "@/contexts/AuthContext";

interface Fabric {
  id: string;
  name: string;
  gsm: string;
  composition: string;
  colors: string[];
  useCase: string;
  category: string;
}

const fabrics: Fabric[] = [
  {
    id: "1",
    name: "Premium Cotton Twill",
    gsm: "180-220",
    composition: "100% Cotton",
    colors: ["White", "Navy", "Black", "Khaki"],
    useCase: "Workwear, Uniforms, Casual Wear",
    category: "Cotton",
  },
  {
    id: "2",
    name: "Polyester Crepe",
    gsm: "120-150",
    composition: "100% Polyester",
    colors: ["Black", "Royal Blue", "Burgundy"],
    useCase: "Formal Wear, Dresses",
    category: "Polyester",
  },
  {
    id: "3",
    name: "Cotton-Poly Blend",
    gsm: "160-180",
    composition: "65% Polyester, 35% Cotton",
    colors: ["White", "Light Blue", "Grey"],
    useCase: "Shirts, Office Wear",
    category: "Blended",
  },
  {
    id: "4",
    name: "Stretch Denim",
    gsm: "280-320",
    composition: "98% Cotton, 2% Spandex",
    colors: ["Indigo", "Black", "Light Wash"],
    useCase: "Jeans, Jackets, Casual Wear",
    category: "Denim",
  },
  {
    id: "5",
    name: "Pure Silk Charmeuse",
    gsm: "80-100",
    composition: "100% Mulberry Silk",
    colors: ["Ivory", "Champagne", "Black"],
    useCase: "Evening Wear, Luxury Apparel",
    category: "Silk",
  },
  {
    id: "6",
    name: "Linen Chambray",
    gsm: "140-160",
    composition: "100% Linen",
    colors: ["Natural", "Blue", "White"],
    useCase: "Summer Wear, Resort Wear",
    category: "Linen",
  },
  {
    id: "7",
    name: "Technical Ripstop",
    gsm: "100-120",
    composition: "100% Nylon",
    colors: ["Black", "Olive", "Navy"],
    useCase: "Outdoor Gear, Bags, Activewear",
    category: "Technical",
  },
  {
    id: "8",
    name: "Organic Cotton Jersey",
    gsm: "160-180",
    composition: "100% Organic Cotton",
    colors: ["White", "Black", "Heather Grey"],
    useCase: "T-shirts, Loungewear",
    category: "Cotton",
  },
  {
    id: "9",
    name: "Satin Duchess",
    gsm: "180-200",
    composition: "100% Polyester Satin",
    colors: ["Ivory", "Gold", "Silver"],
    useCase: "Bridal Wear, Formal Wear",
    category: "Polyester",
  },
];

const categories = ["All", "Cotton", "Polyester", "Blended", "Denim", "Silk", "Linen", "Technical"];

const Fabrics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load products. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.gsm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.color?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || product.color === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...Array.from(new Set(products.map(p => p.color).filter(Boolean)))];

  return (
    <div className="py-12 lg:py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="section-heading">Our Fabric Collection</h1>
          <p className="section-subheading mx-auto">
            Browse our extensive range of quality fabrics. Request bulk quotes for any product.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search fabrics by name, composition, or use case..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-6">
          Showing {filteredProducts.length} of {products.length} products
        </p>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="card-enterprise overflow-hidden animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Product Image */}
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">Fabric</span>
                    </div>
                  </div>
                )}

                {/* Product Details */}
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-3">{product.name}</h3>
                  
                  <div className="space-y-2 mb-4">
                    {product.gsm && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">GSM</span>
                        <span className="font-medium text-foreground">{product.gsm}</span>
                      </div>
                    )}
                    {product.color && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Color</span>
                        <span className="font-medium text-foreground">{product.color}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stock</span>
                      <span className="font-medium text-foreground">{product.stock_quantity}m</span>
                    </div>
                  </div>

                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>
                  )}

                  {user ? (
                    <Link to="/buyer/new-order">
                      <Button className="w-full">
                        Request Quote
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/register">
                      <Button className="w-full" variant="outline">
                        Register to Order
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}

        {/* Note */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Note:</strong> Prices are not displayed publicly. 
            Register as a buyer to request detailed quotations with pricing, tax, and delivery information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Fabrics;
