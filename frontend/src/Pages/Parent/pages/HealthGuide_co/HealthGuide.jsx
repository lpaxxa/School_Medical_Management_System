import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./HealthGuide.css";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";

// Mock data cho các bài viết y tế
export const MOCK_HEALTH_ARTICLES = [
  {
    id: "art001",
    title: "Hướng dẫn phòng ngừa bệnh cúm mùa cho học sinh",
    summary:
      "Tìm hiểu các biện pháp phòng ngừa bệnh cúm mùa hiệu quả cho trẻ em trong độ tuổi học đường.",
    content: `
      <p>Bệnh cúm mùa là bệnh truyền nhiễm phổ biến ở trẻ em, đặc biệt là trong môi trường học đường. Dưới đây là một số biện pháp phòng ngừa hiệu quả:</p>
      
      <h3>1. Tiêm vắc-xin cúm hàng năm</h3>
      <p>Đây là biện pháp phòng ngừa tốt nhất. Trẻ em từ 6 tháng tuổi trở lên nên được tiêm vắc-xin cúm hàng năm, lý tưởng nhất là vào đầu mùa cúm (tháng 9-10).</p>
      
      <h3>2. Rửa tay thường xuyên</h3>
      <p>Hướng dẫn trẻ rửa tay đúng cách với xà phòng và nước ít nhất 20 giây, đặc biệt là trước khi ăn, sau khi đi vệ sinh, và sau khi ho hoặc hắt hơi.</p>
      
      <h3>3. Tránh tiếp xúc gần với người bệnh</h3>
      <p>Khuyến khích trẻ giữ khoảng cách với bạn bè hoặc người thân có biểu hiện bị cúm như ho, sốt, đau họng.</p>
      
      <h3>4. Tăng cường sức đề kháng</h3>
      <p>Đảm bảo trẻ ăn uống đầy đủ chất dinh dưỡng, ngủ đủ giấc, và tập thể dục thường xuyên để tăng cường hệ miễn dịch.</p>
      
      <h3>5. Đeo khẩu trang</h3>
      <p>Trong mùa dịch, trẻ nên đeo khẩu trang khi đến nơi đông người hoặc khi có dấu hiệu ho, hắt hơi.</p>

      <h3>Khi nào nên cho trẻ nghỉ học?</h3>
      <p>Nếu trẻ có các triệu chứng như sốt trên 38°C, ho nhiều, đau họng, đau đầu, mệt mỏi, hãy cho trẻ nghỉ học và đưa đến cơ sở y tế để được khám và điều trị kịp thời.</p>
    `,
    author: "Y tá Nguyễn Thị Hương",
    date: "15/09/2023",
    category: "phong-ngua",
    imageUrl:
      "https://images.unsplash.com/photo-1589279003513-467d320f47eb?q=80&w=2070&auto=format&fit=crop",
    tags: ["cúm mùa", "phòng bệnh", "trẻ em"],
  },
  {
    id: "art002",
    title: "Dinh dưỡng hợp lý cho học sinh trong mùa thi",
    summary:
      "Chế độ dinh dưỡng khoa học giúp học sinh tăng cường sức khỏe và trí nhớ trong mùa thi.",
    content: `
      <p>Mùa thi là thời điểm học sinh cần tập trung cao độ và tiêu hao nhiều năng lượng. Một chế độ dinh dưỡng hợp lý sẽ giúp học sinh duy trì sức khỏe tốt và phát huy tối đa khả năng trí tuệ.</p>
      
      <h3>1. Ăn đủ 3 bữa chính mỗi ngày</h3>
      <p>Không nên bỏ bữa, đặc biệt là bữa sáng. Bữa sáng cung cấp năng lượng cho cả buổi học buổi sáng và giúp tăng khả năng tập trung.</p>
      
      <h3>2. Thực phẩm tăng cường trí nhớ</h3>
      <p>Bổ sung các thực phẩm giàu omega-3 (cá hồi, cá thu, hạt óc chó), chất chống oxy hóa (việt quất, dâu tây), và vitamin B (trứng, thịt nạc).</p>
      
      <h3>3. Uống đủ nước</h3>
      <p>Thiếu nước có thể gây mệt mỏi, khó tập trung. Học sinh nên uống 1.5-2 lít nước mỗi ngày, đặc biệt trong thời gian ôn thi căng thẳng.</p>
      
      <h3>4. Hạn chế đồ ăn vặt không lành mạnh</h3>
      <p>Tránh tiêu thụ quá nhiều đồ ngọt, đồ chiên rán, thức ăn nhanh vì chúng có thể gây buồn ngủ và giảm khả năng tập trung.</p>

      <h3>5. Bổ sung các loại hạt</h3>
      <p>Hạt bí ngô, hạnh nhân, óc chó giàu vitamin E, magiê và kẽm, giúp tăng cường khả năng tập trung và trí nhớ.</p>
      
      <h3>Thực đơn gợi ý cho mùa thi</h3>
      <p><strong>Bữa sáng:</strong> Bánh mì nguyên cám với trứng và một ly sữa</p>
      <p><strong>Bữa trưa:</strong> Cơm gạo lứt với cá hồi và rau xanh</p>
      <p><strong>Bữa tối:</strong> Súp gà với nhiều rau củ</p>
      <p><strong>Bữa phụ:</strong> Trái cây tươi, sữa chua, các loại hạt</p>
    `,
    author: "Y tá Trần Minh Tuấn",
    date: "02/05/2023",
    category: "dinh-duong",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop",
    tags: ["dinh dưỡng", "mùa thi", "học sinh"],
  },
  {
    id: "art003",
    title: "Dấu hiệu nhận biết và cách xử trí khi trẻ bị sốt cao",
    summary:
      "Hướng dẫn cho phụ huynh cách nhận biết và xử trí khi trẻ bị sốt cao tại nhà và thời điểm cần đưa đến bác sĩ.",
    content: `
      <p>Sốt là phản ứng tự nhiên của cơ thể khi chống lại nhiễm trùng. Tuy nhiên, sốt cao có thể gây ra lo lắng cho phụ huynh và đôi khi cần được chăm sóc y tế kịp thời.</p>
      
      <h3>Dấu hiệu nhận biết sốt cao</h3>
      <p>Trẻ được coi là sốt khi nhiệt độ cơ thể trên 38°C. Sốt cao là khi nhiệt độ trên 39°C. Ngoài ra, cần chú ý các dấu hiệu đi kèm như:</p>
      <ul>
        <li>Trẻ mệt mỏi, uể oải bất thường</li>
        <li>Không chịu ăn uống</li>
        <li>Khó thở hoặc thở nhanh</li>
        <li>Phát ban</li>
        <li>Đau đầu dữ dội</li>
        <li>Cứng cổ</li>
        <li>Nôn mửa nhiều lần</li>
      </ul>
      
      <h3>Cách xử trí khi trẻ sốt cao</h3>
      
      <h4>1. Hạ sốt bằng thuốc</h4>
      <p>Sử dụng thuốc hạ sốt như paracetamol hoặc ibuprofen theo đúng liều lượng dựa trên cân nặng của trẻ. Không dùng aspirin cho trẻ dưới 16 tuổi.</p>
      
      <h4>2. Hạ sốt không dùng thuốc</h4>
      <p>- Cho trẻ mặc quần áo mỏng, thoáng mát<br>
      - Giữ nhiệt độ phòng mát mẻ (khoảng 24-25°C)<br>
      - Cho trẻ uống nhiều nước để tránh mất nước<br>
      - Có thể dùng khăn ấm (không phải khăn lạnh) lau người cho trẻ</p>

      <h3>Khi nào cần đưa trẻ đến bác sĩ?</h3>
      <p>- Trẻ dưới 3 tháng tuổi có nhiệt độ trên 38°C<br>
      - Trẻ từ 3-6 tháng có nhiệt độ trên 38.9°C<br>
      - Sốt kéo dài trên 3 ngày<br>
      - Trẻ có dấu hiệu mất nước (khóc không có nước mắt, tã khô)<br>
      - Có các dấu hiệu cảnh báo như co giật, phát ban, cứng cổ</p>
      
      <h3>Lưu ý quan trọng</h3>
      <p>- Không bọc trẻ quá kín khi sốt<br>
      - Không tắm nước lạnh hoặc chườm đá để hạ sốt<br>
      - Không bỏ bữa, nên cho trẻ ăn thức ăn lỏng, dễ tiêu</p>
    `,
    author: "Bác sĩ Lê Thanh Mai",
    date: "20/03/2023",
    category: "so-cap-cuu",
    imageUrl:
      "https://images.unsplash.com/photo-1631217872822-aca0125ab62d?q=80&w=2091&auto=format&fit=crop",
    tags: ["sốt cao", "trẻ em", "sơ cấp cứu"],
  },
  {
    id: "art004",
    title: "Các bài tập thể dục đơn giản giúp học sinh giảm căng thẳng",
    summary:
      "Giới thiệu những bài tập thể dục ngắn có thể thực hiện tại lớp hoặc tại nhà để giảm stress cho học sinh.",
    content: `
      <p>Áp lực học tập có thể gây ra căng thẳng cho học sinh ở mọi lứa tuổi. Bài viết này giới thiệu một số bài tập thể dục đơn giản giúp học sinh thư giãn, giảm căng thẳng và tăng cường tập trung.</p>
      
      <h3>1. Bài tập thở sâu</h3>
      <p>- Ngồi thẳng lưng trên ghế<br>
      - Hít sâu qua mũi trong 4 giây<br>
      - Giữ hơi trong 4 giây<br>
      - Thở ra chậm qua miệng trong 6 giây<br>
      - Lặp lại 5-10 lần</p>
      <p>Bài tập này có thể thực hiện bất cứ lúc nào, đặc biệt là trước khi làm bài kiểm tra hoặc thuyết trình.</p>
      
      <h3>2. Bài tập căng cơ tại bàn học</h3>
      <p>- <strong>Xoay cổ</strong>: Xoay đầu chậm theo vòng tròn, 5 lần theo chiều kim đồng hồ và 5 lần ngược lại<br>
      - <strong>Duỗi vai</strong>: Đan hai tay vào nhau, duỗi thẳng về phía trước, giữ 10 giây rồi thả lỏng<br>
      - <strong>Gập cổ tay</strong>: Xoay cổ tay theo vòng tròn 10 lần mỗi chiều</p>
      
      <h3>3. Bài tập giãn cơ 5 phút</h3>
      <p>- <strong>Chạm ngón chân</strong>: Đứng thẳng, từ từ cúi người chạm ngón chân, giữ 15 giây<br>
      - <strong>Duỗi cánh tay</strong>: Giơ tay phải lên cao, gập khuỷu tay sau đầu, dùng tay trái kéo nhẹ khuỷu tay phải, đổi bên<br>
      - <strong>Xoay hông</strong>: Đứng thẳng, tay chống hông, xoay hông theo vòng tròn 10 lần mỗi chiều</p>

      <h3>4. Bài tập tập trung</h3>
      <p>- <strong>Đếm ngược</strong>: Đếm ngược từ 100 về 0 theo bội số của 7<br>
      - <strong>Yoga ngón tay</strong>: Chạm ngón cái vào từng ngón tay còn lại, tập trung vào cảm giác tiếp xúc</p>
      
      <h3>Thời điểm lý tưởng để tập</h3>
      <p>- Sau mỗi 45-60 phút học tập liên tục<br>
      - Khi cảm thấy mệt mỏi hoặc khó tập trung<br>
      - Trước các kỳ thi hoặc bài kiểm tra quan trọng<br>
      - Buổi sáng sau khi thức dậy và buổi tối trước khi đi ngủ</p>
    `,
    author: "Y tá Phạm Thị Ngọc",
    date: "10/02/2023",
    category: "suc-khoe-tam-than",
    imageUrl:
      "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1920&auto=format&fit=crop",
    tags: ["thể dục", "giảm stress", "sức khỏe tinh thần"],
  },
  {
    id: "art005",
    title: "Hướng dẫn vệ sinh răng miệng đúng cách cho học sinh",
    summary:
      "Các phương pháp chăm sóc răng miệng hiệu quả giúp học sinh phòng ngừa các bệnh về răng thường gặp.",
    content: `
      <p>Sức khỏe răng miệng ảnh hưởng trực tiếp đến sức khỏe tổng thể và chất lượng cuộc sống của học sinh. Bài viết này hướng dẫn các phương pháp vệ sinh răng miệng đúng cách để phòng ngừa các vấn đề răng miệng thường gặp ở lứa tuổi học đường.</p>
      
      <h3>1. Kỹ thuật đánh răng đúng cách</h3>
      <p>- Đánh răng ít nhất 2 lần/ngày, mỗi lần 2 phút<br>
      - Đặt bàn chải nghiêng 45 độ so với nướu<br>
      - Chải nhẹ nhàng theo chuyển động tròn nhỏ<br>
      - Chải tất cả các mặt răng: ngoài, trong và mặt nhai<br>
      - Đừng quên chải lưỡi để loại bỏ vi khuẩn</p>
      
      <h3>2. Sử dụng chỉ nha khoa</h3>
      <p>- Sử dụng khoảng 45cm chỉ nha khoa<br>
      - Quấn phần lớn quanh ngón giữa của hai bàn tay<br>
      - Để lại khoảng 3-5cm giữa hai tay<br>
      - Luồn nhẹ nhàng giữa các kẽ răng theo hình chữ C<br>
      - Học sinh nên bắt đầu sử dụng chỉ nha khoa từ 10-12 tuổi</p>
      
      <h3>3. Chế độ ăn uống lành mạnh cho răng</h3>
      <p>- Hạn chế đồ ngọt, đặc biệt là bánh kẹo dính<br>
      - Tránh đồ uống có gas và nước ép trái cây cô đặc<br>
      - Tăng cường thực phẩm giàu canxi như sữa, phô mai<br>
      - Ăn nhiều rau xanh và trái cây giòn như táo, cà rốt</p>

      <h3>4. Khám răng định kỳ</h3>
      <p>- Khám nha sĩ 6 tháng/lần<br>
      - Vệ sinh răng chuyên nghiệp 12 tháng/lần<br>
      - Kiểm tra và điều trị sâu răng sớm<br>
      - Xem xét niềng răng nếu cần thiết</p>
      
      <h3>5. Bảo vệ răng khi chơi thể thao</h3>
      <p>- Sử dụng bảo vệ răng khi tham gia các môn thể thao có tiếp xúc<br>
      - Tránh dùng răng để mở nắp chai, cắt băng dính</p>
      
      <h3>Các dấu hiệu cần đến gặp nha sĩ ngay</h3>
      <p>- Đau răng kéo dài<br>
      - Nướu sưng, đỏ hoặc chảy máu<br>
      - Nhạy cảm với đồ nóng/lạnh<br>
      - Xuất hiện đốm trắng hoặc nâu trên răng</p>
    `,
    author: "Bác sĩ Nguyễn Văn Hải",
    date: "05/04/2023",
    category: "ve-sinh",
    imageUrl:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?q=80&w=1974&auto=format&fit=crop",
    tags: ["răng miệng", "vệ sinh", "phòng bệnh"],
  },
];

// Danh mục bài viết
export const CATEGORIES = [
  { id: "all", name: "Tất cả bài viết" },
  { id: "phong-ngua", name: "Phòng ngừa bệnh" },
  { id: "dinh-duong", name: "Dinh dưỡng học đường" },
  { id: "so-cap-cuu", name: "Sơ cấp cứu" },
  { id: "suc-khoe-tam-than", name: "Sức khỏe tâm thần" },
  { id: "ve-sinh", name: "Vệ sinh học đường" },
];

const HealthGuide = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch articles
  useEffect(() => {
    // Simulate API call
    setIsLoading(true);
    setTimeout(() => {
      setArticles(MOCK_HEALTH_ARTICLES);
      setFilteredArticles(MOCK_HEALTH_ARTICLES);
      setIsLoading(false);
    }, 800);
  }, []);

  // Filter articles based on category and search term
  useEffect(() => {
    let filtered = articles;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (article) => article.category === selectedCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(term) ||
          article.summary.toLowerCase().includes(term) ||
          article.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    setFilteredArticles(filtered);
  }, [selectedCategory, searchTerm, articles]);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  // Handle search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="health-guide-container">
      <div className="health-guide-header">
        <div className="health-guide-header-content">
          <h1>Cẩm nang y tế học đường</h1>
          <p>
            Tài liệu và hướng dẫn y tế từ đội ngũ y tá và bác sĩ của nhà trường
          </p>
        </div>
      </div>

      <div className="health-guide-content">
        <aside className="health-guide-sidebar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <button className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </div>

          <div className="category-filter">
            <h3>Danh mục</h3>
            <ul>
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <button
                    className={selectedCategory === category.id ? "active" : ""}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="recent-posts">
            <h3>Bài viết mới nhất</h3>
            <ul>
              {articles.slice(0, 3).map((article) => (
                <li key={article.id}>
                  <Link to={`/parent/health-guide/${article.id}`}>
                    <div className="recent-post-image">
                      <img src={article.imageUrl} alt={article.title} />
                    </div>
                    <div className="recent-post-content">
                      <h4>{article.title}</h4>
                      <span className="post-date">{article.date}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="health-guide-articles">
          <div className="articles-header">
            <h2>
              {selectedCategory === "all"
                ? "Tất cả bài viết"
                : CATEGORIES.find((cat) => cat.id === selectedCategory)?.name}
            </h2>
            <p>
              {filteredArticles.length} bài viết được tìm thấy
              {searchTerm && ` cho "${searchTerm}"`}
            </p>
          </div>

          {isLoading ? (
            <LoadingSpinner text="Đang tải bài viết..." />
          ) : filteredArticles.length === 0 ? (
            <div className="no-results">
              <i className="fas fa-search"></i>
              <p>Không tìm thấy bài viết phù hợp</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
              >
                Xem tất cả bài viết
              </button>
            </div>
          ) : (
            <div className="articles-grid">
              {filteredArticles.map((article) => (
                <div key={article.id} className="article-card">
                  <div className="article-image">
                    <img src={article.imageUrl} alt={article.title} />
                  </div>
                  <div className="article-content">
                    <div className="article-meta">
                      <span className="article-category">
                        {
                          CATEGORIES.find((cat) => cat.id === article.category)
                            ?.name
                        }
                      </span>
                      <span className="article-date">{article.date}</span>
                    </div>
                    <h3 className="article-title">
                      <Link to={`/parent/health-guide/${article.id}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <div className="article-footer">
                      <div className="article-author">
                        <i className="fas fa-user-md"></i>
                        <span>{article.author}</span>
                      </div>
                      <Link
                        to={`/parent/health-guide/${article.id}`}
                        className="read-more"
                      >
                        Xem thêm <i className="fas fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default HealthGuide;
