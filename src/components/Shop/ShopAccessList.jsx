import React from "react";

const ShopAccessList = ({ shops = [], selectedShop, setSelectedShop }) => {
  return (
    <div style={{ display: "grid", gap: "12px" }}>
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
              transition: "all 0.2s ease"
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0 }}>
                {shop.name} ({shop.code})
              </h3>

              {isSelected && (
                <span style={{ color: "#007bff", fontWeight: "bold" }}>
                  ✓ Selected
                </span>
              )}
            </div>

            {/* Details */}
            <div style={{ marginTop: "8px", fontSize: "14px" }}>
              <div><b>Address:</b> {shop.address || "-"}</div>
              <div><b>City:</b> {shop.city || "-"}</div>
              <div><b>Country:</b> {shop.country || "-"}</div>
              <div><b>Phone:</b> {shop.phone || "-"}</div>
              <div><b>Email:</b> {shop.email || "-"}</div>
              <div><b>TRN:</b> {shop.trn || "-"}</div>
            </div>

            {/* Image */}
            {shop.shopImagePath && (
              <img
                src={shop.shopImagePath}
                alt="Shop"
                style={{
                  width: "100%",
                  marginTop: "10px",
                  borderRadius: "6px",
                  maxHeight: "150px",
                  objectFit: "cover"
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(ShopAccessList);