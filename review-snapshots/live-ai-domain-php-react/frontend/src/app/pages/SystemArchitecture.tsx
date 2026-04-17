import React, { useState } from 'react';
import { Database, GitBranch, ArrowRight, Users, Package, ShoppingCart, Shield, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

export function SystemArchitecture() {
  const [hoveredEntity, setHoveredEntity] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {/* Header */}
      <div className="bg-[#2E7D32] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Database className="w-10 h-10" />
            <h1 className="text-4xl">System Architecture</h1>
          </div>
          <p className="text-lg opacity-90">
            Visual documentation of the Greenfield Local Hub e-commerce system
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="erd" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="erd" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              ERD
            </TabsTrigger>
            <TabsTrigger value="dataflow" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Data Flow
            </TabsTrigger>
          </TabsList>

          {/* ERD Tab */}
          <TabsContent value="erd" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#2E7D32]" />
                  Entity Relationship Diagram
                </CardTitle>
                <CardDescription>
                  Database schema showing all entities and their relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Legend */}
                <div className="mb-6 p-4 bg-[#FAFAF5] rounded-lg border">
                  <h3 className="text-sm font-semibold mb-3">Legend</h3>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#2E7D32] rounded"></div>
                      <span>Primary Entity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-[#A5D6A7] rounded"></div>
                      <span>Related Entity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#2E7D32] rounded"></div>
                      <span>Junction Table</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-[#2E7D32]" />
                      <span>Relationship</span>
                    </div>
                  </div>
                </div>

                {/* ERD Diagram */}
                <div className="overflow-x-auto">
                  <svg
                    viewBox="0 0 1200 900"
                    className="w-full h-auto"
                    style={{ minHeight: '600px' }}
                  >
                    {/* Relationships (drawn first so entities appear on top) */}
                    {/* User -> Customer */}
                    <line x1="200" y1="150" x2="200" y2="320" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    
                    {/* Customer -> Order */}
                    <line x1="280" y1="400" x2="500" y2="400" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    
                    {/* Order -> OrderItem */}
                    <line x1="600" y1="480" x2="600" y2="620" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    
                    {/* Product -> OrderItem */}
                    <line x1="920" y1="400" x2="680" y2="700" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    
                    {/* Admin -> User */}
                    <line x1="200" y1="800" x2="200" y2="230" stroke="#2E7D32" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />

                    {/* Arrow marker definition */}
                    <defs>
                      <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="10"
                        refX="9"
                        refY="3"
                        orient="auto"
                      >
                        <polygon points="0 0, 10 3, 0 6" fill="#2E7D32" />
                      </marker>
                    </defs>

                    {/* User Entity */}
                    <g
                      onMouseEnter={() => setHoveredEntity('user')}
                      onMouseLeave={() => setHoveredEntity(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="80"
                        y="70"
                        width="240"
                        height="160"
                        fill={hoveredEntity === 'user' ? '#A5D6A7' : '#2E7D32'}
                        stroke="#1B5E20"
                        strokeWidth="2"
                        rx="8"
                      />
                      <text x="200" y="100" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
                        User
                      </text>
                      <line x1="100" y1="115" x2="300" y2="115" stroke="white" strokeWidth="1" />
                      <text x="110" y="140" fill="white" fontSize="12">• id: string (PK)</text>
                      <text x="110" y="160" fill="white" fontSize="12">• email: string (unique)</text>
                      <text x="110" y="180" fill="white" fontSize="12">• password: string (hashed)</text>
                      <text x="110" y="200" fill="white" fontSize="12">• role: 'customer' | 'admin'</text>
                      <text x="110" y="220" fill="white" fontSize="12">• createdAt: Date</text>
                    </g>

                    {/* Customer Entity */}
                    <g
                      onMouseEnter={() => setHoveredEntity('customer')}
                      onMouseLeave={() => setHoveredEntity(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="80"
                        y="320"
                        width="240"
                        height="180"
                        fill={hoveredEntity === 'customer' ? '#A5D6A7' : '#2E7D32'}
                        stroke="#1B5E20"
                        strokeWidth="2"
                        rx="8"
                      />
                      <text x="200" y="350" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
                        Customer
                      </text>
                      <line x1="100" y1="365" x2="300" y2="365" stroke="white" strokeWidth="1" />
                      <text x="110" y="385" fill="white" fontSize="12">• id: string (PK)</text>
                      <text x="110" y="405" fill="white" fontSize="12">• userId: string (FK)</text>
                      <text x="110" y="425" fill="white" fontSize="12">• name: string</text>
                      <text x="110" y="445" fill="white" fontSize="12">• totalSpend: number</text>
                      <text x="110" y="465" fill="white" fontSize="12">• orderCount: number</text>
                      <text x="110" y="485" fill="white" fontSize="12">• loyaltyTier: 'bronze' |</text>
                      <text x="125" y="500" fill="white" fontSize="11">  'silver' | 'gold' | 'platinum'</text>
                    </g>

                    {/* Order Entity */}
                    <g
                      onMouseEnter={() => setHoveredEntity('order')}
                      onMouseLeave={() => setHoveredEntity(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="500"
                        y="320"
                        width="240"
                        height="160"
                        fill={hoveredEntity === 'order' ? '#A5D6A7' : '#2E7D32'}
                        stroke="#1B5E20"
                        strokeWidth="2"
                        rx="8"
                      />
                      <text x="620" y="350" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
                        Order
                      </text>
                      <line x1="520" y1="365" x2="720" y2="365" stroke="white" strokeWidth="1" />
                      <text x="530" y="385" fill="white" fontSize="12">• id: string (PK)</text>
                      <text x="530" y="405" fill="white" fontSize="12">• customerId: string (FK)</text>
                      <text x="530" y="425" fill="white" fontSize="12">• total: number</text>
                      <text x="530" y="445" fill="white" fontSize="12">• status: 'pending' | 'paid' |</text>
                      <text x="545" y="460" fill="white" fontSize="11">  'delivered' | 'collected'</text>
                      <text x="530" y="475" fill="white" fontSize="12">• date: Date</text>
                    </g>

                    {/* OrderItem Entity (Junction) */}
                    <g
                      onMouseEnter={() => setHoveredEntity('orderitem')}
                      onMouseLeave={() => setHoveredEntity(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="480"
                        y="620"
                        width="240"
                        height="140"
                        fill="white"
                        stroke="#2E7D32"
                        strokeWidth="3"
                        rx="8"
                      />
                      <text x="600" y="650" textAnchor="middle" fill="#2E7D32" fontSize="18" fontWeight="bold">
                        OrderItem
                      </text>
                      <line x1="500" y1="665" x2="700" y2="665" stroke="#2E7D32" strokeWidth="1" />
                      <text x="510" y="685" fill="#2E7D32" fontSize="12">• id: string (PK)</text>
                      <text x="510" y="705" fill="#2E7D32" fontSize="12">• orderId: string (FK)</text>
                      <text x="510" y="725" fill="#2E7D32" fontSize="12">• productId: string (FK)</text>
                      <text x="510" y="745" fill="#2E7D32" fontSize="12">• quantity: number</text>
                    </g>

                    {/* Product Entity */}
                    <g
                      onMouseEnter={() => setHoveredEntity('product')}
                      onMouseLeave={() => setHoveredEntity(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="880"
                        y="320"
                        width="240"
                        height="160"
                        fill={hoveredEntity === 'product' ? '#A5D6A7' : '#2E7D32'}
                        stroke="#1B5E20"
                        strokeWidth="2"
                        rx="8"
                      />
                      <text x="1000" y="350" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
                        Product
                      </text>
                      <line x1="900" y1="365" x2="1100" y2="365" stroke="white" strokeWidth="1" />
                      <text x="910" y="385" fill="white" fontSize="12">• id: string (PK)</text>
                      <text x="910" y="405" fill="white" fontSize="12">• name: string</text>
                      <text x="910" y="425" fill="white" fontSize="12">• category: string</text>
                      <text x="910" y="445" fill="white" fontSize="12">• price: number</text>
                      <text x="910" y="465" fill="white" fontSize="12">• stockLevel: number</text>
                    </g>

                    {/* Admin Entity */}
                    <g
                      onMouseEnter={() => setHoveredEntity('admin')}
                      onMouseLeave={() => setHoveredEntity(null)}
                      className="cursor-pointer"
                    >
                      <rect
                        x="80"
                        y="640"
                        width="240"
                        height="160"
                        fill={hoveredEntity === 'admin' ? '#A5D6A7' : '#A5D6A7'}
                        stroke="#2E7D32"
                        strokeWidth="2"
                        rx="8"
                      />
                      <text x="200" y="670" textAnchor="middle" fill="#1B5E20" fontSize="18" fontWeight="bold">
                        Admin
                      </text>
                      <line x1="100" y1="685" x2="300" y2="685" stroke="#1B5E20" strokeWidth="1" />
                      <text x="110" y="705" fill="#1B5E20" fontSize="12">• id: string (PK)</text>
                      <text x="110" y="725" fill="#1B5E20" fontSize="12">• userId: string (FK)</text>
                      <text x="110" y="745" fill="#1B5E20" fontSize="12">• role: 'owner' | 'manager'</text>
                      <text x="110" y="765" fill="#1B5E20" fontSize="12">• permissions: string[]</text>
                      <text x="110" y="785" fill="#1B5E20" fontSize="12">• lastLogin: Date</text>
                    </g>

                    {/* Relationship Labels */}
                    <text x="205" y="240" fill="#1B5E20" fontSize="11" fontWeight="bold">1:1</text>
                    <text x="390" y="390" fill="#1B5E20" fontSize="11" fontWeight="bold">1:N</text>
                    <text x="605" y="550" fill="#1B5E20" fontSize="11" fontWeight="bold">1:N</text>
                    <text x="810" y="550" fill="#1B5E20" fontSize="11" fontWeight="bold">N:1</text>
                    <text x="150" y="530" fill="#1B5E20" fontSize="11" fontWeight="bold">extends</text>
                  </svg>
                </div>

                {/* Entity Details */}
                {hoveredEntity && (
                  <div className="mt-6 p-4 bg-[#A5D6A7]/20 border border-[#2E7D32] rounded-lg">
                    <h3 className="font-semibold text-[#1B5E20] mb-2">
                      {hoveredEntity.charAt(0).toUpperCase() + hoveredEntity.slice(1)} Entity Details
                    </h3>
                    <p className="text-sm text-gray-700">
                      {hoveredEntity === 'user' && 'Core authentication entity storing user credentials and roles.'}
                      {hoveredEntity === 'customer' && 'Customer profile with loyalty tier tracking and purchase history.'}
                      {hoveredEntity === 'order' && 'Order records with status tracking and totals.'}
                      {hoveredEntity === 'orderitem' && 'Junction table linking orders to products with quantities.'}
                      {hoveredEntity === 'product' && 'Product catalog with inventory and pricing information.'}
                      {hoveredEntity === 'admin' && 'Administrative users with role-based access control.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Relationships Summary */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Key Relationships</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>User → Customer:</strong> One-to-One relationship. Each user can have one customer profile.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Customer → Orders:</strong> One-to-Many. A customer can have multiple orders.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Order → OrderItems:</strong> One-to-Many. Each order contains multiple line items.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Product ↔ Order:</strong> Many-to-Many via OrderItem junction table.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Integrity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Primary Keys:</strong> All entities use unique string identifiers.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Foreign Keys:</strong> Maintain referential integrity across entities.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Cascade Rules:</strong> Deleting a customer removes their orders and order items.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-[#2E7D32] mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Constraints:</strong> Email uniqueness, stock levels ≥ 0, valid loyalty tiers.
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Flow Tab */}
          <TabsContent value="dataflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-[#2E7D32]" />
                  System Data Flow
                </CardTitle>
                <CardDescription>
                  How data moves through the application from user actions to database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Customer Flow */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-[#2E7D32]" />
                    <h3 className="text-lg font-semibold">Customer Journey Flow</h3>
                  </div>
                  <div className="bg-white p-6 rounded-lg border-2 border-[#A5D6A7]">
                    <div className="flex flex-wrap items-center gap-3">
                      <FlowStep number="1" label="Browse Products" icon={<Package className="w-4 h-4" />} />
                      <FlowArrow />
                      <FlowStep number="2" label="Add to Cart" icon={<ShoppingCart className="w-4 h-4" />} />
                      <FlowArrow />
                      <FlowStep number="3" label="Login/Register" icon={<Users className="w-4 h-4" />} />
                      <FlowArrow />
                      <FlowStep number="4" label="Checkout" icon={<ShoppingCart className="w-4 h-4" />} />
                      <FlowArrow />
                      <FlowStep number="5" label="Order Created" icon={<Database className="w-4 h-4" />} />
                    </div>
                    <div className="mt-6 space-y-2 text-sm">
                      <div className="flex gap-2">
                        <Badge className="bg-[#2E7D32]">1</Badge>
                        <span>User views product catalog (GET /products)</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-[#2E7D32]">2</Badge>
                        <span>Cart state managed in React Context (client-side)</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-[#2E7D32]">3</Badge>
                        <span>Authentication via POST /auth/login or /auth/register</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-[#2E7D32]">4</Badge>
                        <span>Order submission with payment details</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-[#2E7D32]">5</Badge>
                        <span>Database creates Order + OrderItem records, updates Product stock</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Admin Flow */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-[#2E7D32]" />
                    <h3 className="text-lg font-semibold">Admin Dashboard Flow</h3>
                  </div>
                  <div className="bg-white p-6 rounded-lg border-2 border-[#A5D6A7]">
                    <div className="flex flex-wrap items-center gap-3">
                      <FlowStep number="1" label="Admin Login" icon={<Shield className="w-4 h-4" />} />
                      <FlowArrow />
                      <FlowStep number="2" label="Verify Role" icon={<Shield className="w-4 h-4" />} />
                      <FlowArrow />
                      <FlowStep number="3" label="Load Dashboard" icon={<TrendingUp className="w-4 h-4" />} />
                      <FlowArrow />
                      <FlowStep number="4" label="Manage Data" icon={<Database className="w-4 h-4" />} />
                    </div>
                    <div className="mt-6 space-y-2 text-sm">
                      <div className="flex gap-2">
                        <Badge className="bg-[#2E7D32]">1</Badge>
                        <span>Admin authentication via POST /auth/admin-login</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-[#2E7D32]">2</Badge>
                        <span>Role verification (admin/owner/manager) from User.role</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-[#2E7D32]">3</Badge>
                        <span>Aggregate queries: GET /dashboard/kpis, /orders, /customers, /analytics</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-[#2E7D32]">4</Badge>
                        <span>CRUD operations: Update inventory, change order status, view customer insights</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Processing Flow */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="w-5 h-5 text-[#2E7D32]" />
                    <h3 className="text-lg font-semibold">Order Processing Flow</h3>
                  </div>
                  <div className="bg-white p-6 rounded-lg border-2 border-[#A5D6A7]">
                    <svg viewBox="0 0 900 400" className="w-full h-auto">
                      {/* Client Layer */}
                      <rect x="50" y="50" width="200" height="80" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" rx="8" />
                      <text x="150" y="85" textAnchor="middle" fill="#1B5E20" fontSize="14" fontWeight="bold">
                        Client Layer
                      </text>
                      <text x="150" y="105" textAnchor="middle" fill="#1B5E20" fontSize="12">
                        React Components
                      </text>
                      <text x="150" y="120" textAnchor="middle" fill="#1B5E20" fontSize="11">
                        Cart Context
                      </text>

                      {/* API Layer */}
                      <rect x="350" y="50" width="200" height="80" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" rx="8" />
                      <text x="450" y="85" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                        API Layer
                      </text>
                      <text x="450" y="105" textAnchor="middle" fill="white" fontSize="12">
                        POST /orders
                      </text>
                      <text x="450" y="120" textAnchor="middle" fill="white" fontSize="11">
                        Validation & Auth
                      </text>

                      {/* Database Layer */}
                      <rect x="650" y="50" width="200" height="80" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" rx="8" />
                      <text x="750" y="85" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">
                        Database Layer
                      </text>
                      <text x="750" y="105" textAnchor="middle" fill="white" fontSize="12">
                        Transaction
                      </text>
                      <text x="750" y="120" textAnchor="middle" fill="white" fontSize="11">
                        Create + Update
                      </text>

                      {/* Arrows */}
                      <defs>
                        <marker
                          id="arrow2"
                          markerWidth="10"
                          markerHeight="10"
                          refX="9"
                          refY="3"
                          orient="auto"
                        >
                          <polygon points="0 0, 10 3, 0 6" fill="#2E7D32" />
                        </marker>
                      </defs>

                      <line x1="250" y1="90" x2="350" y2="90" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrow2)" />
                      <line x1="550" y1="90" x2="650" y2="90" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrow2)" />

                      {/* Flow steps */}
                      <text x="150" y="180" textAnchor="middle" fill="#1B5E20" fontSize="13" fontWeight="bold">
                        Step 1: Submit Order
                      </text>
                      <text x="150" y="200" textAnchor="middle" fill="#333" fontSize="11">
                        • User clicks "Place Order"
                      </text>
                      <text x="150" y="215" textAnchor="middle" fill="#333" fontSize="11">
                        • Cart items serialized
                      </text>
                      <text x="150" y="230" textAnchor="middle" fill="#333" fontSize="11">
                        • Customer info attached
                      </text>

                      <text x="450" y="180" textAnchor="middle" fill="#1B5E20" fontSize="13" fontWeight="bold">
                        Step 2: Process
                      </text>
                      <text x="450" y="200" textAnchor="middle" fill="#333" fontSize="11">
                        • Verify authentication
                      </text>
                      <text x="450" y="215" textAnchor="middle" fill="#333" fontSize="11">
                        • Validate product stock
                      </text>
                      <text x="450" y="230" textAnchor="middle" fill="#333" fontSize="11">
                        • Calculate totals
                      </text>

                      <text x="750" y="180" textAnchor="middle" fill="#1B5E20" fontSize="13" fontWeight="bold">
                        Step 3: Persist
                      </text>
                      <text x="750" y="200" textAnchor="middle" fill="#333" fontSize="11">
                        • INSERT Order record
                      </text>
                      <text x="750" y="215" textAnchor="middle" fill="#333" fontSize="11">
                        • INSERT OrderItem(s)
                      </text>
                      <text x="750" y="230" textAnchor="middle" fill="#333" fontSize="11">
                        • UPDATE Product stock
                      </text>
                      <text x="750" y="245" textAnchor="middle" fill="#333" fontSize="11">
                        • UPDATE Customer stats
                      </text>

                      {/* Return path */}
                      <line x1="650" y1="110" x2="550" y2="110" stroke="#A5D6A7" strokeWidth="2" strokeDasharray="5,5" />
                      <line x1="350" y1="110" x2="250" y2="110" stroke="#A5D6A7" strokeWidth="2" strokeDasharray="5,5" />
                      
                      <text x="450" y="290" textAnchor="middle" fill="#1B5E20" fontSize="13" fontWeight="bold">
                        ← Response Flow
                      </text>
                      <text x="450" y="310" textAnchor="middle" fill="#333" fontSize="11">
                        Order confirmation with ID → API response → UI update
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Loyalty Tier Calculation */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
                    <h3 className="text-lg font-semibold">Loyalty Tier Calculation Flow</h3>
                  </div>
                  <div className="bg-white p-6 rounded-lg border-2 border-[#A5D6A7]">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-32 text-center">
                          <div className="bg-[#CD7F32] text-white px-3 py-2 rounded font-semibold">
                            Bronze
                          </div>
                          <div className="text-sm mt-1">$0 - $99</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="w-32 text-center">
                          <div className="bg-[#C0C0C0] text-white px-3 py-2 rounded font-semibold">
                            Silver
                          </div>
                          <div className="text-sm mt-1">$100 - $199</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="w-32 text-center">
                          <div className="bg-[#FFD700] text-white px-3 py-2 rounded font-semibold">
                            Gold
                          </div>
                          <div className="text-sm mt-1">$200 - $399</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                        <div className="w-32 text-center">
                          <div className="bg-[#2E7D32] text-white px-3 py-2 rounded font-semibold">
                            Platinum
                          </div>
                          <div className="text-sm mt-1">$400+</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-[#FAFAF5] rounded-lg border">
                        <p className="text-sm mb-2 font-semibold">Automatic Tier Updates:</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Order is marked as "delivered" or "collected"</li>
                          <li>Order total is added to Customer.totalSpend</li>
                          <li>Customer.orderCount increments</li>
                          <li>Loyalty tier is recalculated based on totalSpend</li>
                          <li>Customer.avgOrderValue is updated</li>
                          <li>Dashboard analytics are refreshed</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Endpoints Summary */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer API Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm font-mono">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-100">GET</Badge>
                    <span>/products</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-blue-100">POST</Badge>
                    <span>/auth/register</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-blue-100">POST</Badge>
                    <span>/auth/login</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-blue-100">POST</Badge>
                    <span>/orders</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-100">GET</Badge>
                    <span>/orders/:customerId</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-100">GET</Badge>
                    <span>/account</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin API Endpoints</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm font-mono">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-blue-100">POST</Badge>
                    <span>/auth/admin-login</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-100">GET</Badge>
                    <span>/dashboard/kpis</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-100">GET</Badge>
                    <span>/dashboard/orders</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-yellow-100">PUT</Badge>
                    <span>/orders/:id/status</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-100">GET</Badge>
                    <span>/dashboard/inventory</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-yellow-100">PUT</Badge>
                    <span>/products/:id/stock</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-100">GET</Badge>
                    <span>/dashboard/customers</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-100">GET</Badge>
                    <span>/dashboard/analytics</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Component for Flow Steps
function FlowStep({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[100px]">
      <div className="w-12 h-12 rounded-full bg-[#2E7D32] text-white flex items-center justify-center font-bold">
        {icon}
      </div>
      <div className="text-center">
        <div className="text-xs font-semibold text-[#2E7D32]">Step {number}</div>
        <div className="text-xs">{label}</div>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <ArrowRight className="w-6 h-6 text-[#2E7D32] flex-shrink-0" />
  );
}
