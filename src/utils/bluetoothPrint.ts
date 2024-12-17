export class BluetoothPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  async connect() {
    try {
      // Request Bluetooth device with expanded printer filters
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'Gprinter' },  // For Goojprt
          { namePrefix: 'XP' },        // For Xprinter
          { namePrefix: 'Printer' },   // Generic printers
          { namePrefix: 'POS' },       // Point of Sale printers
          { namePrefix: 'BT' },        // Bluetooth printers
          { namePrefix: 'THERMAL' },   // Generic thermal printers
          { namePrefix: 'GP' },        // Alternative Goojprt prefix
          { namePrefix: 'ZJ' },        // Zjiang printers
          { namePrefix: 'MTP' },       // Mobile thermal printers
          { namePrefix: 'SP' },        // Serial printers
          { namePrefix: 'ESC' },       // ESC/POS printers
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',  // Common printer service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455',  // Generic serial port service
          '18f0',                                   // Shortened printer service
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2',  // Common printer characteristic
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

      // Try different service UUIDs
      let service;
      const serviceUUIDs = [
        '000018f0-0000-1000-8000-00805f9b34fb',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        '18f0'
      ];

      for (const uuid of serviceUUIDs) {
        try {
          service = await server.getPrimaryService(uuid);
          console.log('Connected to service:', uuid);
          break;
        } catch (error) {
          console.log('Service not found:', uuid);
          continue;
        }
      }

      if (!service) {
        throw new Error('Printer service not found');
      }

      // Try to get the characteristic
      const characteristicUUIDs = [
        '00002af1-0000-1000-8000-00805f9b34fb',
        'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
        '2af1'
      ];

      for (const uuid of characteristicUUIDs) {
        try {
          this.characteristic = await service.getCharacteristic(uuid);
          console.log('Connected to characteristic:', uuid);
          break;
        } catch (error) {
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