import React, { useState, useEffect } from "react";
import Table from 'react-bootstrap/Table';
import {
  fetchAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "../../services/ApiService";
import { toast } from "react-toastify";
import Skeleton from "react-loading-skeleton";
import { Button, Modal, Form } from 'react-bootstrap'; // Sử dụng modal và form từ react-bootstrap
import { useSelector } from "react-redux";

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategoryName, setEditCategoryName] = useState("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const { jwt } = useSelector((state) => state.auth);

  const fetchCategories = async () => {
    try {
      const res = await fetchAllCategories();
      setCategories(res.data);
      setLoadingCategories(false);
    } catch (error) {
      toast.error("Lỗi khi lấy danh mục:", error);
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    try {
      const res = await addCategory({ name: newCategoryName }, jwt);
      setNewCategoryName("");
      setShowAddModal(false);
      fetchCategories();
      toast.success(res.data);
    } catch (error) {
      toast.error("Lỗi khi thêm danh mục:", error);
    }
  };

  const handleEditCategory = async () => {
    try {
      const res = await updateCategory(categoryToEdit.id, { name: editCategoryName }, jwt);
      setEditCategoryName("");
      setShowEditModal(false);
      fetchCategories();
      toast.success(res.data);
    } catch (error) {
      toast.error("Lỗi khi sửa danh mục:", error);
    }
  };

  const confirmDeleteCategory = (id) => {
    const category = categories.find((cat) => cat.id === id);
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    try {
      const res = await deleteCategory(categoryToDelete.id, jwt);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      fetchCategories();
      toast.success(res.data);
    } catch (error) {
      toast.error("Lỗi khi xóa danh mục:", error);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }} className="mx-auto">
      <Button variant="primary" onClick={() => setShowAddModal(true)} className="my-3">
        Thêm danh mục
      </Button>

      <Table striped bordered hover size="sm" style={{ maxWidth: '800px' }} responsive>
        <thead>
          <tr>
            <th className="text-center">Mã</th>
            <th className="text-center">Tên</th>
            <th className="text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loadingCategories
            ? Array(4)
                .fill()
                .map((_, index) => (
                  <tr key={index}>
                    <td><Skeleton width={40} height={20} /></td>
                    <td><Skeleton width={100} height={20} /></td>
                    <td><Skeleton width={80} height={20} /></td>
                  </tr>
                ))
            : categories.map((category) => (
                <tr key={category.id}>
                  <td className="text-center">{category.id}</td>
                  <td className="text-center">{category.name}</td>
                  <td className="text-center">
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => {
                        setCategoryToEdit(category);
                        setEditCategoryName(category.name);
                        setShowEditModal(true);
                      }}
                    >
                      Sửa
                    </Button>{" "}
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => confirmDeleteCategory(category.id)}
                    >
                      Xóa
                    </Button>
                  </td>
                </tr>
              ))}
        </tbody>
      </Table>

      {/* Modal thêm danh mục */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm danh mục</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Nhập tên danh mục"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddCategory}>
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal sửa danh mục */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sửa danh mục</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Nhập tên danh mục"
            value={editCategoryName}
            onChange={(e) => setEditCategoryName(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleEditCategory}>
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
          Bạn có muốn xóa danh mục "{categoryToDelete?.name}" không khi tất cả món ăn thuộc danh mục này đều bị xóa?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteCategory}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ManageCategories;
