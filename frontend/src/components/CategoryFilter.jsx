import React from 'react';
import { 
  Grid, 
  Laptop, 
  Camera, 
  Tv, 
  Cpu, 
  Headphones, 
  Layers 
} from 'lucide-react';

const iconMap = {
  Laptop: Laptop,
  Camera: Camera,
  Tv: Tv,
  Cpu: Cpu,
  Headphones: Headphones,
  Default: Layers
};

export const CategoryFilter = ({ categories, selectedCategory, onSelectCategory, totalCount }) => {
  const getIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || iconMap.Default;
    return <IconComponent size={16} />;
  };

  return (
    <div className="category-chips-row">
      <button
        className={`category-chip ${selectedCategory === null ? 'active' : ''}`}
        onClick={() => onSelectCategory(null)}
      >
        <Grid size={16} />
        <span>All Equipment</span>
        {totalCount !== undefined && <span className="chip-count">{totalCount}</span>}
      </button>

      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(cat.id)}
        >
          {getIcon(cat.iconName)}
          <span>{cat.name}</span>
          <span className="chip-count">{cat.itemCount}</span>
        </button>
      ))}
    </div>
  );
};
