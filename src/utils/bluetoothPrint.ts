export class BluetoothPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  async connect() {
    try {
      // Request Bluetooth device with printer service
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Gprinter' },  // For Goojprt
          { namePrefix: 'XP' },        // For Xprinter
          { namePrefix: 'Printer' },   // Generic printer
          { namePrefix: 'POS' },       // Generic POS printer
          { namePrefix: 'THERMAL' },   // Generic thermal printer
          { namePrefix: 'BT' },        // Generic Bluetooth printer
          { namePrefix: 'ZJ' },        // Zjiang printers
          { namePrefix: 'MTP' },       // MTP-II and similar
          { namePrefix: 'SP' },        // Star Micronics
          { namePrefix: 'ESC' },       // Epson compatible
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Common printer service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Widely used printer service
          '18f0',                                  // Short form printer service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Common printer service
        ]
      });

      if (!this.device) {
        throw new Error('No printer selected');
      }

      console.log('Connecting to printer:', this.device.name);
      
      const server = await this.device.gatt?.connect();
      if (!server) {
        throw new Error('Could not connect to printer');
      }

      console.log('Connected to GATT server, discovering services...');

      // Try different service UUIDs
      const serviceUUIDs = [
        '000018f0-0000-1000-8000-00805f9b34fb',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        '18f0',
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
      ];

      let service;
      for (const uuid of serviceUUIDs) {
        try {
          service = await server.getPrimaryService(uuid);
          console.log('Found printer service:', uuid);
          break;
        } catch (e) {
          console.log('Service not found:', uuid);
          continue;
        }
      }

      if (!service) {
        throw new Error('Printer service not found');
      }

      // Try different characteristic UUIDs
      const characteristicUUIDs = [
        '00002af1-0000-1000-8000-00805f9b34fb',
        '49535343-8841-43f4-a8d4-ecbe34729bb3',
        '2af1',
        'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f'
      ];

      for (const uuid of characteristicUUIDs) {
        try {
          this.characteristic = await service.getCharacteristic(uuid);
          console.log('Found printer characteristic:', uuid);
          break;
        } catch (e) {
          console.log('Characteristic not found:', uuid);
          continue;
        }
      }

      if (!this.characteristic) {
        throw new Error('Printer characteristic not found');
      }

      return true;
    } catch (error) {
      console.error('Bluetooth connection error:', error);
      throw error;
    }
  }

  async print(data: string) {
    if (!this.characteristic) {
      throw new Error('Printer not connected');
    }

    try {
      // Convert text to printer commands
      const encoder = new TextEncoder();
      const commands = [
        '\x1B\x40',     // Initialize printer
        '\x1B\x61\x01', // Center alignment
        data,
        '\x0A\x0A\x0A', // Feed lines
        '\x1D\x56\x41', // Cut paper
      ].join('');

      const bytes = encoder.encode(commands);
      await this.characteristic.writeValue(bytes);
      return true;
    } catch (error) {
      console.error('Print error:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }
}