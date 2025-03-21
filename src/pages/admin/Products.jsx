"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from "../../firebase/config"
import "./Products.css"

const Products = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    description: "",
    soldOut: false,
    sale: false,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, "products"))
      const productsData = []

      querySnapshot.forEach((doc) => {
        productsData.push({
          id: doc.id,
          ...doc.data(),
        })
      })

      setProducts(productsData)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const openModal = (product = null) => {
    if (product) {
      setCurrentProduct(product)
      setFormData({
        name: product.name,
        price: product.price.toString(),
        originalPrice: product.originalPrice ? product.originalPrice.toString() : "",
        description: product.description || "",
        soldOut: product.soldOut || false,
        sale: product.sale || false,
      })
      setImagePreview(product.images?.[0] || "")
    } else {
      setCurrentProduct(null)
      setFormData({
        name: "",
        price: "",
        originalPrice: "",
        description: "",
        soldOut: false,
        sale: false,
      })
      setImagePreview("")
      setImageFile(null)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentProduct(null)
    setFormData({
      name: "",
      price: "",
      originalPrice: "",
      description: "",
      soldOut: false,
      sale: false,
    })
    setImagePreview("")
    setImageFile(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name || !formData.price) {
      setError("Name and price are required")
      return
    }

    try {
      setIsSubmitting(true)

      let imageUrl = currentProduct?.images?.[0] || ""

      // Upload image if a new one is selected
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`)
        await uploadBytes(storageRef, imageFile)
        imageUrl = await getDownloadURL(storageRef)
      }

      const productData = {
        name: formData.name,
        price: Number.parseFloat(formData.price),
        originalPrice: formData.originalPrice ? Number.parseFloat(formData.originalPrice) : null,
        description: formData.description,
        soldOut: formData.soldOut,
        sale: formData.sale,
        images: [imageUrl],
        updatedAt: serverTimestamp(),
      }

      if (currentProduct) {
        // Update existing product
        await updateDoc(doc(db, "products", currentProduct.id), productData)
      } else {
        // Add new product
        productData.createdAt = serverTimestamp()
        await addDoc(collection(db, "products"), productData)
      }

      closeModal()
      fetchProducts()
    } catch (err) {
      console.error("Error saving product:", err)
      setError("Failed to save product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (productId, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      // Delete product document
      await deleteDoc(doc(db, "products", productId))

      // Delete image from storage if it exists
      if (imageUrl) {
        try {
          const imageRef = ref(storage, imageUrl)
          await deleteObject(imageRef)
        } catch (imageErr) {
          console.error("Error deleting image:", imageErr)
          // Continue even if image deletion fails
        }
      }

      // Update local state
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId))
    } catch (err) {
      console.error("Error deleting product:", err)
      setError("Failed to delete product")
    }
  }

  return (
    <div className="admin-products">
      <div className="container">
        <div className="products-header">
          <h1 className="page-title">Manage Products</h1>
          <button className="add-product-btn" onClick={() => openModal()}>
            Add New Product
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-indicator">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products found. Add your first product!</div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card admin-product-card">
                <div className="product-image-container">
                  <img src={product.images?.[0] || "/placeholder.svg"} alt={product.name} className="product-image" />
                  {product.soldOut && <span className="product-badge sold-out">Sold out</span>}
                  {product.sale && <span className="product-badge sale">Sale</span>}
                </div>

                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <div className="product-price">
                    {product.originalPrice && product.originalPrice > product.price ? (
                      <>
                        <span className="price-sale">${product.price.toFixed(2)} USD</span>
                        <span className="price-original">${product.originalPrice.toFixed(2)} USD</span>
                      </>
                    ) : (
                      <span className="price-regular">${product.price.toFixed(2)} USD</span>
                    )}
                  </div>
                </div>

                <div className="product-actions">
                  <button className="edit-button" onClick={() => openModal(product)}>
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteProduct(product.id, product.images?.[0])}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{currentProduct ? "Edit Product" : "Add New Product"}</h2>
                <button className="close-modal" onClick={closeModal}>
                  ×
                </button>
              </div>

              <form className="product-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Product Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Price ($)</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="originalPrice">Original Price ($) (optional)</label>
                    <input
                      type="number"
                      id="originalPrice"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                  ></textarea>
                </div>

                <div className="form-row checkbox-row">
                  <div className="form-group checkbox-group">
                    <input
                      type="checkbox"
                      id="soldOut"
                      name="soldOut"
                      checked={formData.soldOut}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="soldOut">Sold Out</label>
                  </div>

                  <div className="form-group checkbox-group">
                    <input type="checkbox" id="sale" name="sale" checked={formData.sale} onChange={handleInputChange} />
                    <label htmlFor="sale">On Sale</label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="image">Product Image</label>
                  <input type="file" id="image" name="image" onChange={handleImageChange} accept="image/*" />

                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview || "/placeholder.svg"} alt="Preview" />
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-button" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="save-button" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products

