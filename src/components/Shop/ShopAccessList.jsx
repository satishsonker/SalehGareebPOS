import React from "react";

const ShopAccessList = ({ shops = [], selectedShop, setSelectedShop }) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px"
      }}
    >
      {shops.length === 0 && (
        <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#777" }}>
          No shops available. Please contact your administrator.
        </div>
      )}
      {shops.map((shop) => {
        const isSelected = selectedShop?.id === shop.id;

        return (
          <div
            key={shop.id}
            onClick={() => setSelectedShop(shop)}
            style={{
              border: isSelected ? "2px solid #007bff" : "1px solid #ddd",
              borderRadius: "10px",
              padding: "12px",
              cursor: "pointer",
              background: isSelected ? "#eef6ff" : "#fff",
              transition: "all 0.2s ease",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              height: "210px"
            }}
          >
            {/* LEFT: Image */}
            <div style={{ flexShrink: 0 }}>
              <img
                src={shop.shopImagePath || "/assets/images/default-shop-image.jpg"}
                alt="Shop"
                loading="lazy"
                onError={(e) =>
                  (e.target.src = "/assets/images/default-shop-image.jpg")
                }
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  border: "1px solid #eee"
                }}
              />
              {isSelected && (
                <div style={{
                  color: "rgb(0, 123, 255)",
                  fontWeight: "bold",
                  width: "100%",
                  textAlign: "center",
                  marginTop: "20px"
                }}>
                  ✓ Selected
                </div>
              )}
            </div>

            {/* RIGHT: Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>
                  {shop.name} ({shop.code})
                </h3>


              </div>

              <div style={{ marginTop: "8px", fontSize: "14px" }}>
                <div><b>Address:</b> {shop.address || "-"}</div>
                <div><b>City:</b> {shop.city || "-"}</div>
                <div><b>Country:</b> {shop.country || "-"}</div>
                <div><b>Phone:</b> {shop.phone || "-"}</div>
                <div><b>Email:</b> {shop.email || "-"}</div>
                <div><b>TRN:</b> {shop.trn || "-"}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(ShopAccessList);