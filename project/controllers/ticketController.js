const docClient = require("../config/aws");
const uploadToS3 = require("../config/s3");

const { PutCommand, ScanCommand, DeleteCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

// lấy danh sách (hiển thị, tìm kiếm, tính toán)
exports.getAll = async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME.trim() }));
    let tickets = result.Items || [];

    const keyword = req.query.search;
    if (keyword) {
      tickets = tickets.filter(t => t.eventName && t.eventName.toLowerCase().includes(keyword.toLowerCase()));
    }

    // Hàm tính toán nghiệp vụ
    let totalInventoryValue = 0;
    tickets = tickets.map(t => {
      const ticketTotalValue = (t.price || 0) * (t.quantity || 0);
      totalInventoryValue += ticketTotalValue;
      return { ...t, ticketTotalValue };
    });

    res.render("index", { tickets, keyword: keyword || "", totalInventoryValue });
  } catch (error) {
    console.error("getAll error:", error);
    res.status(500).send("Error fetching tickets");
  }
};

// hiển thị form
exports.showAddForm = (req, res) => {
  res.render("add");
};

// validate
function validateTicket(data) {
  const errors = [];

  if (!data.ticketID) errors.push("Thiếu ID");
  if (!data.eventName || data.eventName.length < 3)
    errors.push("Tên >= 3 ký tự");

  return errors;
}

// thêm
exports.create = async (req, res) => {
  try {
    const errors = validateTicket(req.body);

    if (errors.length > 0) {
      return res.render("add", { errors });
    }

    let imageUrl = "";

    if (req.file) {
      imageUrl = await uploadToS3(req.file);
    }

    const item = {
      ticketID: req.body.ticketID,
      eventName: req.body.eventName,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity)
    };

    if (imageUrl) {
      item.imageUrl = imageUrl;
    }

    await docClient.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME.trim(),
        Item: item
      })
    );

    res.redirect("/");
  } catch (error) {
    console.error("create error:", error);
    res.status(500).send("Error creating ticket");
  }
};

// xóa
exports.delete = async (req, res) => {
  try {
    await docClient.send(
      new DeleteCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME.trim(),
        Key: { ticketID: req.params.id }
      })
    );
    res.redirect("/");
  } catch (error) {
    console.error("delete error:", error);
    res.status(500).send("Error deleting ticket");
  }
};

// sửa form
exports.showEditForm = async (req, res) => {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME.trim(),
        Key: { ticketID: req.params.id }
      })
    );
    if (!result.Item) return res.status(404).send("Not found");
    res.render("edit", { ticket: result.Item, errors: [] });
  } catch (error) {
    console.error("showEditForm error:", error);
    res.status(500).send("Error fetching ticket");
  }
};

// cập nhật
exports.update = async (req, res) => {
  try {
    const errors = validateTicket({ ...req.body, ticketID: req.params.id });

    if (errors.length > 0) {
      return res.render("edit", { ticket: { ...req.body, ticketID: req.params.id, imageUrl: req.body.existingImage }, errors });
    }

    let imageUrl = req.body.existingImage || "";

    if (req.file) {
      imageUrl = await uploadToS3(req.file);
    }

    const item = {
      ticketID: req.params.id,
      eventName: req.body.eventName,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity)
    };

    if (imageUrl) {
      item.imageUrl = imageUrl;
    }

    await docClient.send(
      new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME.trim(),
        Item: item
      })
    );

    res.redirect("/");
  } catch (error) {
    console.error("update error:", error);
    res.status(500).send("Error updating ticket");
  }
};