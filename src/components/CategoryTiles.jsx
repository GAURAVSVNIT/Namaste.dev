import { useState } from 'react';

const CategoryTiles = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const categories = [
    { name: "Tops", description: "Fresh fits from casual to chic", image: "photo-1649972904349-6e44c42644a7", itemCount: 156, color: "from-pink-400/80 to-rose-500/80" },
    { name: "Bottoms", description: "Denim, joggers & everything between", image: "photo-1581091226825-a6a2a5aee158", itemCount: 98, color: "from-blue-400/80 to-indigo-500/80" },
    { name: "Footwear", description: "Step up your sneaker game", image: "photo-1526374965328-7f61d4dc18c5", itemCount: 74, color: "from-purple-400/80 to-violet-500/80" },
    { name: "Accessories", description: "Details that make the difference", image: "photo-1487058792275-0ad4aaf24ca7", itemCount: 89, color: "from-green-400/80 to-teal-500/80" }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-clash font-bold mb-4">
            Shop by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Explore our curated selection of fashion essentials
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="group relative floating-card cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <img src={`https://images.unsplash.com/${category.image}?w=400&h=400&fit=crop&crop=center`} alt={category.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} transition-opacity duration-500 ${hoveredIndex === index ? 'opacity-80' : 'opacity-60'}`} />
                <div className="absolute inset-0 glass-card border-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <div className="space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl font-clash font-bold">{category.name}</h3>
                    <p className="text-sm opacity-90 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">{category.description}</p>
                    <p className="text-xs opacity-75 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-200">{category.itemCount} items</p>
                  </div>
                </div>
                <div className={`absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xs font-bold transition-all duration-500 ${hoveredIndex === index ? 'scale-110 rotate-12' : 'scale-100'}`}>
                  {index + 1}
                </div>
                {hoveredIndex === index && (
                  <>
                    <div className="absolute top-8 left-8 w-2 h-2 bg-white/50 rounded-full animate-ping" />
                    <div className="absolute bottom-16 right-12 w-3 h-3 bg-white/30 rounded-full animate-pulse" />
                    <div className="absolute top-1/2 left-4 w-1 h-1 bg-white/60 rounded-full animate-bounce" />
                  </>
                )}
              </div>
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} rounded-2xl transform translate-x-2 translate-y-2 -z-10 transition-all duration-300 ${hoveredIndex === index ? 'translate-x-4 translate-y-4 opacity-30' : 'opacity-20'}`} />
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <button className="btn-3d text-lg px-8 py-4 transform hover:scale-105 transition-all duration-300">
            View All Categories
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoryTiles;
