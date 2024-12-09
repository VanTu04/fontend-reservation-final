import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import {
  fetchAllCategories,
  fetchAllProducts,
  addProduct,
  addImage,
  updateProduct,
  deleteProduct,
} from "../../services/ApiService";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import { Button, Modal, Form, Image } from "react-bootstrap";
import { useSelector } from "react-redux";

function ManageFood() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    thumbnail: "",
    description: "",
    available: true,
    category_id: "",
  });
  const [editProduct, setEditProduct] = useState({
    name: "",
    price: 0,
    thumbnail: "",
    thumbnailFile: null,
    description: "",
    available: true,
    category_id: "",
  });
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const { jwt } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await fetchAllProducts();
      setProducts(res.data);
      setLoadingProducts(false);
    } catch (error) {
      toast.error("Lỗi khi lấy sản phẩm:", error);
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetchAllCategories();
        setCategories(res.data);
      } catch (error) {
        toast.error("Lỗi khi lấy danh mục:", error);
      }
    };
    fetchCategories();
    fetchProducts();
  }, []);

  const handleAddProduct = async () => {
    console.log(newProduct);
    try {
      const res = await addProduct(
        {
          ...newProduct,
          thumbnail: null,
        },
        jwt
      );

      if (
        newProduct.thumbnailFile &&
        !(newProduct.thumbnailFile instanceof FileReader)
      ) {
        // Kiểm tra nếu thumbnailFile không phải là FileReader và không null/undefined
        await addImage(res.data.id, newProduct.thumbnailFile, jwt);
      }

      setNewProduct({
        name: "",
        price: 0,
        thumbnailFile: null,
        description: "",
        available: true,
        categoryId: "",
      });
      setShowAddModal(false);
      fetchProducts();
      toast.success("Thêm sản phẩm thành công!");
    } catch (error) {
      toast.error("Lỗi khi thêm sản phẩm:", error);
    }
  };
  const handleEditProduct = async () => {
    try {
      const res = await updateProduct(editProduct.id, editProduct, jwt);
      // Upload hình ảnh nếu có
      if (editProduct.thumbnailFile) {
        await addImage(res.data.id, editProduct.thumbnailFile, jwt);
      }

      setEditProduct(null);
      setShowEditModal(false);
      fetchProducts();
      toast.success("Update successfully!");
    } catch (error) {
      toast.error("Lỗi khi sửa sản phẩm:", error);
    }
  };

  const confirmDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleDeleteProduct = async () => {
    try {
      const res = await deleteProduct(productToDelete.id, jwt);
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchProducts();
      toast.success(res.data);
    } catch (error) {
      toast.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  const handleCloseAddModal = () => {
    setNewProduct({
      name: "",
      price: 0,
      thumbnailFile: null,
      description: "",
      available: true,
      category_id: "",
    }); // Đặt lại newProduct về trạng thái ban đầu
    setShowAddModal(false);
  };

  const getCategoryNameById = (categoryId) => {
    const category = categories.find((category) => category.id === categoryId);
    return category ? category.name : "Chưa có danh mục";
  };
console.log(products);
  return (
    <div style={{ maxWidth: "1000px" }} className="mx-auto">
      <Button
        variant="primary"
        onClick={() => setShowAddModal(true)}
        className="my-3"
      >
        Thêm sản phẩm
      </Button>

      <Table striped bordered hover size="sm" responsive>
        <thead>
          <tr>
            <th className="text-center">Mã</th>
            <th className="text-center">Tên</th>
            <th className="text-center">Giá</th>
            <th className="text-center">Hình ảnh</th>
            <th className="text-center">Mô tả</th>
            <th className="text-center">Trạng thái</th>
            <th className="text-center">Danh mục</th>
            <th className="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loadingProducts
            ? // Placeholder for loading state (Skeleton or Spinner can be used here)
              Array(4)
                .fill()
                .map((_, index) => (
                  <tr key={index}>
                    <td>
                      <Skeleton width={40} height={20} />
                    </td>
                    <td>
                      <Skeleton width={100} height={20} />
                    </td>
                    <td>
                      <Skeleton width={60} height={20} />
                    </td>
                    <td>
                      <Skeleton width={80} height={60} />
                    </td>
                    <td>
                      <Skeleton width={150} height={20} />
                    </td>
                    <td>
                      <Skeleton width={60} height={20} />
                    </td>
                    <td>
                      <Skeleton width={100} height={20} />
                    </td>
                    <td>
                      <Skeleton width={80} height={20} />
                    </td>
                  </tr>
                ))
            : // Display products from JSON data
              products.map((product) => (
                <tr key={product.id}>
                  <td className="text-center">{product.id}</td>
                  <td className="text-center">{product.name}</td>
                  <td className="text-center">
                    {product.price.toLocaleString()} VND
                  </td>
                  <td className="text-center">
                    <Image
                      src={`http://binhan.serveftp.com:8080/api/images/uploads/${product.thumbnail}`}
                      alt={product.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td className="text-center">
                    {product.description.length > 30
                      ? product.description.substring(0, 30) + "..."
                      : product.description}
                  </td>
                  <td className="text-center">
                    {product.available ? "available" : "not available"}
                  </td>
                  <td className="text-center">
                    {/* You can map category_id to a category name if you have a category list */}
                    {getCategoryNameById(product.category_id)}
                  </td>
                  <td className="text-center">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => {
                        setEditProduct(product);
                        setShowEditModal(true);
                      }}
                    >
                      Sửa
                    </Button>{" "}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDeleteProduct(product)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
        </tbody>
      </Table>

      {/* Modal thêm sản phẩm */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên sản phẩm</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên sản phẩm"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Giá</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập giá sản phẩm"
                value={newProduct.price}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    price: parseFloat(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh (Thumbnail)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setNewProduct({
                        ...newProduct,
                        // thumbnail: reader.result,
                        thumbnailFile: file, // Lưu file để gửi khi thêm
                      });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập mô tả sản phẩm"
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="available"
                checked={newProduct.available}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, available: e.target.checked })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select
                value={newProduct.category_id || ""} // Hiển thị id của danh mục đã chọn
                onChange={(e) => {
                  const selectedCategory = categories.find(
                    (category) => category.id === Number(e.target.value) // Tìm danh mục từ id
                  );
                  setNewProduct({
                    ...newProduct,
                    category_id: selectedCategory?.id, // Cập nhật id danh mục
                    category_name: selectedCategory?.name, // Cập nhật tên danh mục (nếu cần)
                  });
                }}
              >
                <option value="" disabled>
                  Chọn danh mục
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddProduct}>
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal sửa sản phẩm */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sửa sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên sản phẩm</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên sản phẩm"
                value={editProduct?.name || ""}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, name: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Giá</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập giá sản phẩm"
                value={editProduct?.price || 0}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    price: parseFloat(e.target.value),
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh (Thumbnail)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setEditProduct({
                      ...editProduct,
                      thumbnailFile: file, // Cập nhật file vào state
                    });
                  }
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập mô tả sản phẩm"
                value={editProduct?.description || ""}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    description: e.target.value,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="available"
                checked={editProduct?.available || false}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    available: e.target.checked,
                  })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select
                value={editProduct?.category_id || ""} // Hiển thị id của danh mục đã chọn
                onChange={(e) => {
                  const selectedCategory = categories.find(
                    (category) => category.id === Number(e.target.value) // Tìm danh mục từ id
                  );

                  // Nếu người dùng chọn một danh mục mới, cập nhật category_id và category_name
                  setEditProduct({
                    ...editProduct,
                    category_id:
                      selectedCategory?.id || editProduct.category_id, // Nếu không có category được chọn, giữ id cũ
                    category_name:
                      selectedCategory?.name || editProduct.category_name, // Cập nhật category_name nếu chọn mới, nếu không giữ tên cũ
                  });
                }}
              >
                <option value="" disabled>
                  Chọn danh mục
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleEditProduct}>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.name}" không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteProduct}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ManageFood;
