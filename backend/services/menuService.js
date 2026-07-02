const MenuItem = require('../models/MenuItem');

exports.getAllMenuItems = async () => {
  return await MenuItem.find({ available: true });
};

exports.createMenuItem = async (data) => {
  const newItem = new MenuItem(data);
  return await newItem.save();
};

exports.updateMenuItem = async (id, data) => {
  return await MenuItem.findByIdAndUpdate(id, data, { new: true, runValidators: true });
};

exports.deleteMenuItem = async (id) => {
  return await MenuItem.findByIdAndDelete(id);
};

exports.getMenuContextString = async () => {
  const menuItems = await this.getAllMenuItems();
  let menuContext = "Current Menu:\n";
  menuItems.forEach(item => {
    menuContext += `- ${item.name} ($${item.price}): ${item.description}\n`;
    if (item.customizations && item.customizations.length > 0) {
      menuContext += `  Customizations available:\n`;
      item.customizations.forEach(c => {
        menuContext += `    * ${c.name}: ${c.options.join(', ')}\n`;
      });
    }
  });
  return menuContext;
};
