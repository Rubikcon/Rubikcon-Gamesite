import { storage } from '../storage-db';

export class InventoryService {
  static async reduceInventory(gameId: number, quantity: number) {
    if (process.env.AUTO_REDUCE_INVENTORY !== 'true') return;
    
    try {
      const game = await storage.getGameById(gameId);
      if (!game) throw new Error('Game not found');
      
      const newStock = Math.max(0, (game.stock || 0) - quantity);
      await storage.updateGameStock(gameId, newStock);
      
      // Check low stock threshold
      const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || '5');
      if (newStock <= threshold) {
        await this.sendLowStockAlert(game.title, newStock);
      }
    } catch (error) {
      console.error('Inventory reduction failed:', error);
    }
  }

  static async sendLowStockAlert(gameTitle: string, currentStock: number) {
    // Send webhook notification
    if (process.env.ADMIN_NOTIFICATION_WEBHOOK) {
      try {
        await fetch(process.env.ADMIN_NOTIFICATION_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Low Stock Alert: ${gameTitle} has only ${currentStock} units left!`
          })
        });
      } catch (error) {
        console.error('Failed to send low stock alert:', error);
      }
    }
  }
}