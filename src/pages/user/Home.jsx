import React, { useState, useEffect } from "react";
import {
  fetchAllCategories,
  fetchFoodsByCategory,
} from "../../services/ApiService";
import { toast } from "react-toastify";
import "./Home.scss";
import { Card, Placeholder } from "react-bootstrap";

function Home() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingFoods, setLoadingFoods] = useState(false);

  // Lấy danh sách danh mục khi tải ứng dụng
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetchAllCategories(); // Giả sử API này chỉ trả về danh sách danh mục, không bao gồm sản phẩm
        setCategories(res.data);
        setLoadingCategories(false);

        // Gọi API để lấy sản phẩm cho danh mục đầu tiên (cate 1)
        if (res.data.length > 0) {
          handleCategorySelect(res.data[0]);
        }
      } catch (error) {
        toast.error("Lỗi khi lấy danh mục:", error);
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Gọi API để lấy danh sách sản phẩm khi chọn danh mục
  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setLoadingFoods(true);

    try {
      const res = await fetchFoodsByCategory(category.id); // API trả về danh sách sản phẩm thuộc danh mục
      setFoods(res.data);
    } catch (error) {
      toast.error("Lỗi khi lấy danh sách sản phẩm:", error);
    } finally {
      setLoadingFoods(false);
    }
  };

  return (
    <div className="home-container">
      <div className="category-list">
        {loadingCategories ? (
          <Card style={{ width: "18rem" }}>
            <Card.Body>
              <Placeholder.Button variant="primary" xs={4} />
              <Placeholder.Button xs={4} />
              <Placeholder.Button xs={4} />
            </Card.Body>
          </Card>
        ) : (
          categories.map((category) => (
            <button
              key={category.id}
              className={`category-button ${
                selectedCategory?.id === category.id ? "active" : ""
              }`}
              onClick={() => handleCategorySelect(category)}
            >
              {category.name}
            </button>
          ))
        )}
      </div>

      <div className="product-list">
        {loadingFoods ? (
          <Card style={{ width: "18rem" }}>
            <Card.Img variant="top" src="holder.js/100px180" />
            <Card.Body>
              <Placeholder as={Card.Title} animation="glow">
                <Placeholder xs={6} />
              </Placeholder>
              <Placeholder as={Card.Text} animation="glow">
                <Placeholder xs={7} /> <Placeholder xs={4} />{" "}
                <Placeholder xs={4} /> <Placeholder xs={6} />{" "}
                <Placeholder xs={8} />
              </Placeholder>
              <Placeholder.Button variant="primary" xs={6} />
            </Card.Body>
          </Card>
        ) : selectedCategory ? (
          <>
            {foods.length > 0 ? (
              <div className="products-grid">
                {foods.map((food) => (
                  <div className="product-card" key={food.id}>
                    <img
                      src={`http://binhan.serveftp.com:8080/api/images/uploads/${food.thumbnail}`}
                      alt={food.name}
                      className="product-thumbnail"
                    />
                    <h3>{food.name}</h3>
                    <p>{food.description}</p>
                    <p className="product-price">
                      {food.price.toLocaleString()} VND
                    </p>
                    <div
                      className={`status ${
                        food.available ? "ready" : "not-ready"
                      }`}
                    >
                      {food.available ? "Sẵn sàng phục vụ" : "Không sẵn sàng"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Không có sản phẩm nào trong danh mục này.</p>
            )}
          </>
        ) : (
          <p>Vui lòng chọn một danh mục để xem sản phẩm.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
