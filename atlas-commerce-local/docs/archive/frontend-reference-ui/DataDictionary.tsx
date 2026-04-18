import React, { useState } from 'react';
import { Database, Search, Table2, Key, Link as LinkIcon, AlertCircle, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';

interface TableField {
  name: string;
  type: string;
  length?: string;
  nullable: boolean;
  defaultValue: string | null;
  key: 'PRI' | 'UNI' | 'MUL' | 'FK' | null;
  extra: string;
  comment: string;
}

interface TableDefinition {
  name: string;
  engine: string;
  collation: string;
  rowCount: number;
  dataLength: string;
  comment: string;
  fields: TableField[];
  indexes: {
    name: string;
    type: string;
    columns: string[];
  }[];
  foreignKeys: {
    column: string;
    references: string;
    onDelete: string;
    onUpdate: string;
  }[];
}

const tables: TableDefinition[] = [
  {
    name: 'users',
    engine: 'InnoDB',
    collation: 'utf8mb4_unicode_ci',
    rowCount: 150,
    dataLength: '16 KB',
    comment: 'Core user authentication and authorization table',
    fields: [
      {
        name: 'id',
        type: 'VARCHAR',
        length: '36',
        nullable: false,
        defaultValue: null,
        key: 'PRI',
        extra: 'UUID',
        comment: 'Unique identifier for user',
      },
      {
        name: 'email',
        type: 'VARCHAR',
        length: '255',
        nullable: false,
        defaultValue: null,
        key: 'UNI',
        extra: '',
        comment: 'User email address (unique)',
      },
      {
        name: 'password',
        type: 'VARCHAR',
        length: '255',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: 'bcrypt hashed',
        comment: 'Hashed password using bcrypt',
      },
      {
        name: 'role',
        type: 'ENUM',
        length: "'customer','admin','owner','manager'",
        nullable: false,
        defaultValue: "'customer'",
        key: null,
        extra: '',
        comment: 'User role for access control',
      },
      {
        name: 'email_verified',
        type: 'BOOLEAN',
        nullable: false,
        defaultValue: 'FALSE',
        key: null,
        extra: '',
        comment: 'Email verification status',
      },
      {
        name: 'created_at',
        type: 'TIMESTAMP',
        nullable: false,
        defaultValue: 'CURRENT_TIMESTAMP',
        key: null,
        extra: '',
        comment: 'Account creation timestamp',
      },
      {
        name: 'updated_at',
        type: 'TIMESTAMP',
        nullable: false,
        defaultValue: 'CURRENT_TIMESTAMP',
        key: null,
        extra: 'ON UPDATE CURRENT_TIMESTAMP',
        comment: 'Last update timestamp',
      },
      {
        name: 'last_login',
        type: 'TIMESTAMP',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Last successful login timestamp',
      },
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'idx_email', type: 'UNIQUE', columns: ['email'] },
      { name: 'idx_role', type: 'INDEX', columns: ['role'] },
    ],
    foreignKeys: [],
  },
  {
    name: 'customers',
    engine: 'InnoDB',
    collation: 'utf8mb4_unicode_ci',
    rowCount: 120,
    dataLength: '24 KB',
    comment: 'Customer profile and loyalty information',
    fields: [
      {
        name: 'id',
        type: 'VARCHAR',
        length: '36',
        nullable: false,
        defaultValue: null,
        key: 'PRI',
        extra: 'UUID',
        comment: 'Unique customer identifier',
      },
      {
        name: 'user_id',
        type: 'VARCHAR',
        length: '36',
        nullable: false,
        defaultValue: null,
        key: 'FK',
        extra: '',
        comment: 'Reference to users table',
      },
      {
        name: 'first_name',
        type: 'VARCHAR',
        length: '100',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Customer first name',
      },
      {
        name: 'last_name',
        type: 'VARCHAR',
        length: '100',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Customer last name',
      },
      {
        name: 'phone',
        type: 'VARCHAR',
        length: '20',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Contact phone number',
      },
      {
        name: 'address_line1',
        type: 'VARCHAR',
        length: '255',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Primary address line',
      },
      {
        name: 'address_line2',
        type: 'VARCHAR',
        length: '255',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Secondary address line (optional)',
      },
      {
        name: 'city',
        type: 'VARCHAR',
        length: '100',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'City name',
      },
      {
        name: 'state',
        type: 'VARCHAR',
        length: '50',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'State/Province',
      },
      {
        name: 'zip_code',
        type: 'VARCHAR',
        length: '20',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Postal/ZIP code',
      },
      {
        name: 'total_spend',
        type: 'DECIMAL',
        length: '10,2',
        nullable: false,
        defaultValue: '0.00',
        key: null,
        extra: '',
        comment: 'Total lifetime spending',
      },
      {
        name: 'order_count',
        type: 'INT',
        nullable: false,
        defaultValue: '0',
        key: null,
        extra: '',
        comment: 'Total number of orders placed',
      },
      {
        name: 'avg_order_value',
        type: 'DECIMAL',
        length: '10,2',
        nullable: false,
        defaultValue: '0.00',
        key: null,
        extra: 'COMPUTED',
        comment: 'Average order value (computed)',
      },
      {
        name: 'loyalty_tier',
        type: 'ENUM',
        length: "'bronze','silver','gold','platinum'",
        nullable: false,
        defaultValue: "'bronze'",
        key: null,
        extra: '',
        comment: 'Customer loyalty tier',
      },
      {
        name: 'loyalty_points',
        type: 'INT',
        nullable: false,
        defaultValue: '0',
        key: null,
        extra: '',
        comment: 'Accumulated loyalty points',
      },
      {
        name: 'last_order_date',
        type: 'TIMESTAMP',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Date of last order',
      },
      {
        name: 'created_at',
        type: 'TIMESTAMP',
        nullable: false,
        defaultValue: 'CURRENT_TIMESTAMP',
        key: null,
        extra: '',
        comment: 'Profile creation date',
      },
      {
        name: 'updated_at',
        type: 'TIMESTAMP',
        nullable: false,
        defaultValue: 'CURRENT_TIMESTAMP',
        key: null,
        extra: 'ON UPDATE CURRENT_TIMESTAMP',
        comment: 'Last profile update',
      },
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'idx_user_id', type: 'UNIQUE', columns: ['user_id'] },
      { name: 'idx_loyalty_tier', type: 'INDEX', columns: ['loyalty_tier'] },
      { name: 'idx_total_spend', type: 'INDEX', columns: ['total_spend'] },
      { name: 'idx_email', type: 'INDEX', columns: ['user_id', 'last_order_date'] },
    ],
    foreignKeys: [
      {
        column: 'user_id',
        references: 'users(id)',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    ],
  },
  {
    name: 'products',
    engine: 'InnoDB',
    collation: 'utf8mb4_unicode_ci',
    rowCount: 50,
    dataLength: '32 KB',
    comment: 'Product catalog with inventory tracking',
    fields: [
      {
        name: 'id',
        type: 'VARCHAR',
        length: '36',
        nullable: false,
        defaultValue: null,
        key: 'PRI',
        extra: 'UUID',
        comment: 'Unique product identifier',
      },
      {
        name: 'name',
        type: 'VARCHAR',
        length: '255',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Product name',
      },
      {
        name: 'slug',
        type: 'VARCHAR',
        length: '255',
        nullable: false,
        defaultValue: null,
        key: 'UNI',
        extra: '',
        comment: 'URL-friendly product slug',
      },
      {
        name: 'description',
        type: 'TEXT',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Product description',
      },
      {
        name: 'category',
        type: 'VARCHAR',
        length: '100',
        nullable: false,
        defaultValue: null,
        key: 'MUL',
        extra: '',
        comment: 'Product category',
      },
      {
        name: 'price',
        type: 'DECIMAL',
        length: '10,2',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Product price per unit',
      },
      {
        name: 'unit',
        type: 'VARCHAR',
        length: '50',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Unit of measure (lb, pint, bunch, etc.)',
      },
      {
        name: 'stock_level',
        type: 'INT',
        nullable: false,
        defaultValue: '0',
        key: null,
        extra: '',
        comment: 'Current stock quantity',
      },
      {
        name: 'low_stock_threshold',
        type: 'INT',
        nullable: false,
        defaultValue: '10',
        key: null,
        extra: '',
        comment: 'Alert threshold for low stock',
      },
      {
        name: 'image_url',
        type: 'VARCHAR',
        length: '500',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Product image URL',
      },
      {
        name: 'is_active',
        type: 'BOOLEAN',
        nullable: false,
        defaultValue: 'TRUE',
        key: null,
        extra: '',
        comment: 'Product visibility status',
      },
      {
        name: 'is_organic',
        type: 'BOOLEAN',
        nullable: false,
        defaultValue: 'FALSE',
        key: null,
        extra: '',
        comment: 'Organic certification flag',
      },
      {
        name: 'total_sold',
        type: 'INT',
        nullable: false,
        defaultValue: '0',
        key: null,
        extra: '',
        comment: 'Lifetime units sold',
      },
      {
        name: 'revenue',
        type: 'DECIMAL',
        length: '12,2',
        nullable: false,
        defaultValue: '0.00',
        key: null,
        extra: '',
        comment: 'Total revenue generated',
      },
      {
        name: 'created_at',
        type: 'TIMESTAMP',
        nullable: false,
        defaultValue: 'CURRENT_TIMESTAMP',
        key: null,
        extra: '',
        comment: 'Product creation date',
      },
      {
        name: 'updated_at',
        type: 'TIMESTAMP',
        nullable: false,
        defaultValue: 'CURRENT_TIMESTAMP',
        key: null,
        extra: 'ON UPDATE CURRENT_TIMESTAMP',
        comment: 'Last update timestamp',
      },
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'idx_slug', type: 'UNIQUE', columns: ['slug'] },
      { name: 'idx_category', type: 'INDEX', columns: ['category'] },
      { name: 'idx_active', type: 'INDEX', columns: ['is_active'] },
      { name: 'idx_stock', type: 'INDEX', columns: ['stock_level'] },
    ],
    foreignKeys: [],
  },
  {
    name: 'orders',
    engine: 'InnoDB',
    collation: 'utf8mb4_unicode_ci',
    rowCount: 450,
    dataLength: '64 KB',
    comment: 'Customer order records',
    fields: [
      {
        name: 'id',
        type: 'VARCHAR',
        length: '36',
        nullable: false,
        defaultValue: null,
        key: 'PRI',
        extra: 'UUID',
        comment: 'Unique order identifier',
      },
      {
        name: 'order_number',
        type: 'VARCHAR',
        length: '50',
        nullable: false,
        defaultValue: null,
        key: 'UNI',
        extra: 'AUTO-GENERATED',
        comment: 'Human-readable order number',
      },
      {
        name: 'customer_id',
        type: 'VARCHAR',
        length: '36',
        nullable: false,
        defaultValue: null,
        key: 'FK',
        extra: '',
        comment: 'Reference to customers table',
      },
      {
        name: 'subtotal',
        type: 'DECIMAL',
        length: '10,2',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Order subtotal before tax',
      },
      {
        name: 'tax',
        type: 'DECIMAL',
        length: '10,2',
        nullable: false,
        defaultValue: '0.00',
        key: null,
        extra: '',
        comment: 'Sales tax amount',
      },
      {
        name: 'total',
        type: 'DECIMAL',
        length: '10,2',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Total order amount',
      },
      {
        name: 'status',
        type: 'ENUM',
        length: "'pending','paid','processing','delivered','collected','cancelled','refunded'",
        nullable: false,
        defaultValue: "'pending'",
        key: null,
        extra: '',
        comment: 'Order fulfillment status',
      },
      {
        name: 'payment_method',
        type: 'VARCHAR',
        length: '50',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Payment method used',
      },
      {
        name: 'payment_status',
        type: 'ENUM',
        length: "'pending','completed','failed','refunded'",
        nullable: false,
        defaultValue: "'pending'",
        key: null,
        extra: '',
        comment: 'Payment transaction status',
      },
      {
        name: 'notes',
        type: 'TEXT',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Customer or admin notes',
      },
      {
        name: 'created_at',
        type: 'TIMESTAMP',
        nullable: false,
        defaultValue: 'CURRENT_TIMESTAMP',
        key: null,
        extra: '',
        comment: 'Order placement date',
      },
      {
        name: 'updated_at',
        type: 'TIMESTAMP',
        nullable: false,
        defaultValue: 'CURRENT_TIMESTAMP',
        key: null,
        extra: 'ON UPDATE CURRENT_TIMESTAMP',
        comment: 'Last status update',
      },
      {
        name: 'completed_at',
        type: 'TIMESTAMP',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Order completion timestamp',
      },
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'idx_order_number', type: 'UNIQUE', columns: ['order_number'] },
      { name: 'idx_customer_id', type: 'INDEX', columns: ['customer_id'] },
      { name: 'idx_status', type: 'INDEX', columns: ['status'] },
      { name: 'idx_created_at', type: 'INDEX', columns: ['created_at'] },
      { name: 'idx_customer_date', type: 'INDEX', columns: ['customer_id', 'created_at'] },
    ],
    foreignKeys: [
      {
        column: 'customer_id',
        references: 'customers(id)',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
    ],
  },
  {
    name: 'order_items',
    engine: 'InnoDB',
    collation: 'utf8mb4_unicode_ci',
    rowCount: 1250,
    dataLength: '96 KB',
    comment: 'Individual line items in orders',
    fields: [
      {
        name: 'id',
        type: 'VARCHAR',
        length: '36',
        nullable: false,
        defaultValue: null,
        key: 'PRI',
        extra: 'UUID',
        comment: 'Unique line item identifier',
      },
      {
        name: 'order_id',
        type: 'VARCHAR',
        length: '36',
        nullable: false,
        defaultValue: null,
        key: 'FK',
        extra: '',
        comment: 'Reference to orders table',
      },
      {
        name: 'product_id',
        type: 'VARCHAR',
        length: '36',
        nullable: false,
        defaultValue: null,
        key: 'FK',
        extra: '',
        comment: 'Reference to products table',
      },
      {
        name: 'product_name',
        type: 'VARCHAR',
        length: '255',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Product name snapshot at order time',
      },
      {
        name: 'quantity',
        type: 'INT',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Quantity ordered',
      },
      {
        name: 'unit_price',
        type: 'DECIMAL',
        length: '10,2',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Price per unit at order time',
      },
      {
        name: 'line_total',
        type: 'DECIMAL',
        length: '10,2',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: 'COMPUTED',
        comment: 'Total for this line item',
      },
      {
        name: 'created_at',
        type: 'TIMESTAMP',
        nullable: false,
        defaultValue: 'CURRENT_TIMESTAMP',
        key: null,
        extra: '',
        comment: 'Line item creation date',
      },
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'idx_order_id', type: 'INDEX', columns: ['order_id'] },
      { name: 'idx_product_id', type: 'INDEX', columns: ['product_id'] },
      { name: 'idx_order_product', type: 'INDEX', columns: ['order_id', 'product_id'] },
    ],
    foreignKeys: [
      {
        column: 'order_id',
        references: 'orders(id)',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      {
        column: 'product_id',
        references: 'products(id)',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      },
    ],
  },
  {
    name: 'admins',
    engine: 'InnoDB',
    collation: 'utf8mb4_unicode_ci',
    rowCount: 5,
    dataLength: '8 KB',
    comment: 'Administrative user permissions and roles',
    fields: [
      {
        name: 'id',
        type: 'VARCHAR',
        length: '36',
        nullable: false,
        defaultValue: null,
        key: 'PRI',
        extra: 'UUID',
        comment: 'Unique admin identifier',
      },
      {
        name: 'user_id',
        type: 'VARCHAR',
        length: '36',
        nullable: false,
        defaultValue: null,
        key: 'FK',
        extra: '',
        comment: 'Reference to users table',
      },
      {
        name: 'admin_role',
        type: 'ENUM',
        length: "'owner','manager','support'",
        nullable: false,
        defaultValue: "'support'",
        key: null,
        extra: '',
        comment: 'Administrative role level',
      },
      {
        name: 'permissions',
        type: 'JSON',
        nullable: false,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'JSON array of permission strings',
      },
      {
        name: 'can_manage_products',
        type: 'BOOLEAN',
        nullable: false,
        defaultValue: 'TRUE',
        key: null,
        extra: '',
        comment: 'Permission to manage products',
      },
      {
        name: 'can_manage_orders',
        type: 'BOOLEAN',
        nullable: false,
        defaultValue: 'TRUE',
        key: null,
        extra: '',
        comment: 'Permission to manage orders',
      },
      {
        name: 'can_view_customers',
        type: 'BOOLEAN',
        nullable: false,
        defaultValue: 'TRUE',
        key: null,
        extra: '',
        comment: 'Permission to view customer data',
      },
      {
        name: 'can_view_analytics',
        type: 'BOOLEAN',
        nullable: false,
        defaultValue: 'TRUE',
        key: null,
        extra: '',
        comment: 'Permission to view analytics',
      },
      {
        name: 'last_login',
        type: 'TIMESTAMP',
        nullable: true,
        defaultValue: null,
        key: null,
        extra: '',
        comment: 'Last admin dashboard login',
      },
      {
        name: 'created_at',
        type: 'TIMESTAMP',
        nullable: false,
        defaultValue: 'CURRENT_TIMESTAMP',
        key: null,
        extra: '',
        comment: 'Admin account creation date',
      },
      {
        name: 'updated_at',
        type: 'TIMESTAMP',
        nullable: false,
        defaultValue: 'CURRENT_TIMESTAMP',
        key: null,
        extra: 'ON UPDATE CURRENT_TIMESTAMP',
        comment: 'Last permission update',
      },
    ],
    indexes: [
      { name: 'PRIMARY', type: 'PRIMARY KEY', columns: ['id'] },
      { name: 'idx_user_id', type: 'UNIQUE', columns: ['user_id'] },
      { name: 'idx_admin_role', type: 'INDEX', columns: ['admin_role'] },
    ],
    foreignKeys: [
      {
        column: 'user_id',
        references: 'users(id)',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
    ],
  },
];

export function DataDictionary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTable, setSelectedTable] = useState<string>(tables[0].name);

  const filteredTables = tables.filter(
    (table) =>
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTable = tables.find((t) => t.name === selectedTable);

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {/* Header */}
      <div className="bg-[#2E7D32] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <FileText className="w-10 h-10" />
            <h1 className="text-4xl">Data Dictionary</h1>
          </div>
          <p className="text-lg opacity-90">
            Complete database schema documentation for Greenfield Local Hub
          </p>
          <div className="mt-4 text-sm opacity-75">
            Database Engine: MySQL 8.0 | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Stats */}
        <div className="mb-6 grid md:grid-cols-4 gap-4">
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search tables, fields, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#A5D6A7] rounded-lg">
                  <Table2 className="w-5 h-5 text-[#1B5E20]" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{tables.length}</div>
                  <div className="text-sm text-gray-600">Total Tables</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#A5D6A7] rounded-lg">
                  <Database className="w-5 h-5 text-[#1B5E20]" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {tables.reduce((sum, t) => sum + t.rowCount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table List */}
        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Table2 className="w-4 h-4" />
                  Tables
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {filteredTables.map((table) => (
                    <button
                      key={table.name}
                      onClick={() => setSelectedTable(table.name)}
                      className={`w-full text-left px-4 py-3 hover:bg-[#A5D6A7]/20 transition-colors border-l-4 ${
                        selectedTable === table.name
                          ? 'bg-[#A5D6A7]/30 border-[#2E7D32] font-semibold'
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm">{table.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {table.rowCount}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{table.comment}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Details */}
          <div className="md:col-span-3">
            {currentTable && (
              <div className="space-y-6">
                {/* Table Info */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-mono">{currentTable.name}</CardTitle>
                        <CardDescription>{currentTable.comment}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-[#2E7D32]">{currentTable.engine}</Badge>
                        <Badge variant="outline">{currentTable.rowCount} rows</Badge>
                        <Badge variant="outline">{currentTable.dataLength}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600">
                      <strong>Collation:</strong> {currentTable.collation}
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="structure" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="structure">Structure</TabsTrigger>
                    <TabsTrigger value="indexes">Indexes</TabsTrigger>
                    <TabsTrigger value="relations">Relations</TabsTrigger>
                  </TabsList>

                  {/* Structure Tab */}
                  <TabsContent value="structure">
                    <Card>
                      <CardContent className="p-0">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-[#FAFAF5]">
                                <TableHead className="font-bold">Field</TableHead>
                                <TableHead className="font-bold">Type</TableHead>
                                <TableHead className="font-bold">Null</TableHead>
                                <TableHead className="font-bold">Key</TableHead>
                                <TableHead className="font-bold">Default</TableHead>
                                <TableHead className="font-bold">Extra</TableHead>
                                <TableHead className="font-bold">Comment</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {currentTable.fields.map((field, idx) => (
                                <TableRow key={idx} className="hover:bg-[#A5D6A7]/10">
                                  <TableCell className="font-mono font-semibold">
                                    {field.name}
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">
                                    {field.type}
                                    {field.length && `(${field.length})`}
                                  </TableCell>
                                  <TableCell>
                                    {field.nullable ? (
                                      <Badge variant="outline" className="text-xs">
                                        YES
                                      </Badge>
                                    ) : (
                                      <Badge className="text-xs bg-[#2E7D32]">NO</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {field.key && (
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          field.key === 'PRI'
                                            ? 'bg-[#2E7D32] text-white'
                                            : field.key === 'FK'
                                            ? 'bg-[#A5D6A7]'
                                            : ''
                                        }`}
                                      >
                                        {field.key === 'PRI' && <Key className="w-3 h-3 mr-1" />}
                                        {field.key === 'FK' && <LinkIcon className="w-3 h-3 mr-1" />}
                                        {field.key}
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-mono text-xs">
                                    {field.defaultValue === null ? (
                                      <span className="text-gray-400 italic">NULL</span>
                                    ) : (
                                      field.defaultValue
                                    )}
                                  </TableCell>
                                  <TableCell className="text-xs text-gray-600">
                                    {field.extra}
                                  </TableCell>
                                  <TableCell className="text-xs text-gray-600">
                                    {field.comment}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Indexes Tab */}
                  <TabsContent value="indexes">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Index Definitions</CardTitle>
                        <CardDescription>
                          Indexes improve query performance on these columns
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-[#FAFAF5]">
                              <TableHead className="font-bold">Index Name</TableHead>
                              <TableHead className="font-bold">Type</TableHead>
                              <TableHead className="font-bold">Columns</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentTable.indexes.map((index, idx) => (
                              <TableRow key={idx} className="hover:bg-[#A5D6A7]/10">
                                <TableCell className="font-mono font-semibold">
                                  {index.name}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      index.type === 'PRIMARY KEY'
                                        ? 'bg-[#2E7D32]'
                                        : 'bg-[#A5D6A7] text-[#1B5E20]'
                                    }
                                  >
                                    {index.type}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {index.columns.join(', ')}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Relations Tab */}
                  <TabsContent value="relations">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Foreign Key Constraints</CardTitle>
                        <CardDescription>
                          Relationships to other tables in the database
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {currentTable.foreignKeys.length > 0 ? (
                          <div className="space-y-4">
                            {currentTable.foreignKeys.map((fk, idx) => (
                              <div
                                key={idx}
                                className="p-4 border-2 border-[#A5D6A7] rounded-lg bg-white"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-[#A5D6A7] rounded">
                                    <LinkIcon className="w-4 h-4 text-[#1B5E20]" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-mono text-sm mb-2">
                                      <strong>{currentTable.name}.{fk.column}</strong>
                                      <span className="mx-2 text-gray-400">→</span>
                                      <strong>{fk.references}</strong>
                                    </div>
                                    <div className="flex gap-4 text-xs text-gray-600">
                                      <div>
                                        <span className="font-semibold">ON DELETE:</span>{' '}
                                        <Badge variant="outline" className="ml-1">
                                          {fk.onDelete}
                                        </Badge>
                                      </div>
                                      <div>
                                        <span className="font-semibold">ON UPDATE:</span>{' '}
                                        <Badge variant="outline" className="ml-1">
                                          {fk.onUpdate}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>No foreign key constraints defined for this table</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Additional Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-blue-900 mb-1">Database Notes:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                          <li>All timestamps are stored in UTC timezone</li>
                          <li>UUID v4 format used for all primary keys</li>
                          <li>Passwords are hashed using bcrypt with cost factor 10</li>
                          <li>CASCADE deletes propagate to dependent records</li>
                          <li>RESTRICT prevents deletion if dependent records exist</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
