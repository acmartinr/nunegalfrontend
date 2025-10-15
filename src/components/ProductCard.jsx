import React from 'react'

export default function ProductCard({ item, onClick }) {
  return (
    <div className="card" onClick={onClick} role="button" tabIndex={0}>
      <img src={item.imgUrl || item.image || 'https://via.placeholder.com/300x200?text=Phone'} alt={item.model} />
      <div className="title">{item.brand} {item.model}</div>
      <div>{Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(item.price || 0)}</div>
    </div>
  )
}
