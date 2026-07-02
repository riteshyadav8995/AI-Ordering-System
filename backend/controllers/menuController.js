const menuService = require('../services/menuService');

exports.getMenu = async (req, res) => {
  try {
    const menuItems = await menuService.getAllMenuItems();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu items', error: error.message });
  }
};

exports.addMenuItem = async (req, res) => {
  try {
    const savedItem = await menuService.createMenuItem(req.body);
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error creating menu item', error: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const updatedItem = await menuService.updateMenuItem(req.params.id, req.body);
    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating menu item', error: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const deletedItem = await menuService.deleteMenuItem(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting menu item', error: error.message });
  }
};
