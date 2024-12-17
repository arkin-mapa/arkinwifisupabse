export class BluetoothPrinter {
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  async connect() {
    try {
      console.log('Requesting Bluetooth device...');
      // Request any Bluetooth device without filters
      this.device = await navigator.bluetooth.requestDevice({
        // Accept all devices by not specifying any filters
        acceptAllDevices: true,
        // Include common printer service UUIDs as optional services
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Common printer service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Generic printer service
          '18f0',  // Shortened version sometimes used
          '1814',  // HID Service
        ]
      });

      if (!this.device) {
        throw new Error('No device selected');
      }

      console.log('Connecting to device:', this.device.name);
      const server = await this.device.gatt?.connect();
      if (!server) {
        throw new Error('Could not connect to device');
      }

      // Try different service UUIDs
      const serviceUUIDs = [
        '000018f0-0000-1000-8000-00805f9b34fb',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        '18f0',
        '1814'
      ];

      let service;
      for (const uuid of serviceUUIDs) {
        try {
          console.log('Attempting to get service:', uuid);
          service = await server.getPrimaryService(uuid);
          if (service) {
            console.log('Service found:', uuid);
            break;
          }
        } catch (e) {
          console.log('Service not found:', uuid);
          continue;
        }
      }

      if (!service) {
        throw new Error('No compatible service found');
      }

      // Try different characteristic UUIDs
      const characteristicUUIDs = [
        '00002af1-0000-1000-8000-00805f9b34fb',
        '49535343-8841-43f4-a8d4-ecbe34729bb3',
        '2AF1',
        '2A4D'
      ];

      for (const uuid of characteristicUUIDs) {
        try {
          console.log('Attempting to get characteristic:', uuid);
          this.characteristic = await service.getCharacteristic(uuid);
          if (this.characteristic) {
            console.log('Characteristic found:', uuid);
            break;
          }
        } catch (e) {
          console.log('Characteristic not found:', uuid);
          continue;
        }
      }

      if (!this.characteristic) {
        throw new Error('No compatible characteristic found');
      }

      console.log('Successfully connected to device');
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