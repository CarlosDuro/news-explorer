// src/components/SearchBar/SearchBar.jsx
import { useEffect, useState } from 'react';
import '../../styles/base.css';
import '../../styles/results.css';

function SearchBar({ initialQuery = '', onSearch, isLoading }) {
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    setValue(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) {
      alert('Por favor, introduzca una palabra clave');
      return;
    }
    onSearch && onSearch(q);
  };

  return (
    <form className="searchbar" onSubmit={handleSubmit}>
      <input
        type="text"
        name="q"
        placeholder="Introduce un tema"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
      />
      <button className="btn" type="submit" disabled={isLoading}>
        {isLoading ? 'Buscando…' : 'Buscar'}
      </button>
    </form>
  );
}

export default SearchBar;
