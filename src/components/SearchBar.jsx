import React from 'react'

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Buscar por Marca o Modelo…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Buscar"
      />
    </div>
  )
}
