import React, { useState } from 'react';
import { 
  GitBranch, 
  User, 
  ShoppingCart, 
  Package, 
  Shield, 
  TrendingUp, 
  CreditCard, 
  Database, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';

export function Flowcharts() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FAFAF5]">
      {/* Header */}
      <div className="bg-[#2E7D32] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <GitBranch className="w-10 h-10" />
            <h1 className="text-4xl">System Flowcharts</h1>
          </div>
          <p className="text-lg opacity-90">
            Visual process flows for all major operations in Greenfield Local Hub
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="auth" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 mb-8">
            <TabsTrigger value="auth" className="flex items-center gap-1 text-xs">
              <User className="w-3 h-3" />
              <span className="hidden sm:inline">Auth</span>
            </TabsTrigger>
            <TabsTrigger value="shopping" className="flex items-center gap-1 text-xs">
              <ShoppingCart className="w-3 h-3" />
              <span className="hidden sm:inline">Shopping</span>
            </TabsTrigger>
            <TabsTrigger value="checkout" className="flex items-center gap-1 text-xs">
              <CreditCard className="w-3 h-3" />
              <span className="hidden sm:inline">Checkout</span>
            </TabsTrigger>
            <TabsTrigger value="order" className="flex items-center gap-1 text-xs">
              <Package className="w-3 h-3" />
              <span className="hidden sm:inline">Order</span>
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex items-center gap-1 text-xs">
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">Admin</span>
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-1 text-xs">
              <Database className="w-3 h-3" />
              <span className="hidden sm:inline">Inventory</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span className="hidden sm:inline">Loyalty</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-1 text-xs">
              <CreditCard className="w-3 h-3" />
              <span className="hidden sm:inline">Payment</span>
            </TabsTrigger>
          </TabsList>

          {/* Authentication Flow */}
          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#2E7D32]" />
                  User Authentication Flow
                </CardTitle>
                <CardDescription>
                  Registration and login process for customer and admin users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <svg viewBox="0 0 800 1400" className="w-full h-auto" style={{ minHeight: '700px' }}>
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#2E7D32" />
                      </marker>
                    </defs>

                    {/* Start */}
                    <ellipse cx="400" cy="30" rx="60" ry="25" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="38" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">START</text>

                    {/* User visits login page */}
                    <rect x="300" y="80" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="400" y="105" textAnchor="middle" fontSize="13">User visits</text>
                    <text x="400" y="125" textAnchor="middle" fontSize="13">/login or /admin-login</text>
                    <line x1="400" y1="55" x2="400" y2="80" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    {/* Decision: Has Account? */}
                    <path d="M 400 160 L 480 220 L 400 280 L 320 220 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="400" y="215" textAnchor="middle" fontSize="12" fontWeight="bold">Has</text>
                    <text x="400" y="230" textAnchor="middle" fontSize="12" fontWeight="bold">Account?</text>
                    <line x1="400" y1="140" x2="400" y2="160" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    {/* No - Register */}
                    <text x="510" y="225" fontSize="11" fontWeight="bold" fill="#2E7D32">No</text>
                    <rect x="540" y="190" width="180" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="630" y="215" textAnchor="middle" fontSize="12">Enter registration</text>
                    <text x="630" y="235" textAnchor="middle" fontSize="12">details</text>
                    <line x1="480" y1="220" x2="540" y2="220" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    {/* Validate Registration */}
                    <path d="M 630 270 L 710 330 L 630 390 L 550 330 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="630" y="325" textAnchor="middle" fontSize="11" fontWeight="bold">Valid</text>
                    <text x="630" y="340" textAnchor="middle" fontSize="11" fontWeight="bold">Data?</text>
                    <line x1="630" y1="250" x2="630" y2="270" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    {/* Invalid - Show Error */}
                    <text x="730" y="335" fontSize="11" fontWeight="bold" fill="#D32F2F">No</text>
                    <rect x="740" y="300" width="140" height="60" rx="8" fill="#FFCDD2" stroke="#D32F2F" strokeWidth="2" />
                    <text x="810" y="325" textAnchor="middle" fontSize="12" fill="#D32F2F">Show error</text>
                    <text x="810" y="345" textAnchor="middle" fontSize="12" fill="#D32F2F">message</text>
                    <line x1="710" y1="330" x2="740" y2="330" stroke="#D32F2F" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    
                    {/* Loop back */}
                    <path d="M 810 300 L 810 220 L 720 220" stroke="#D32F2F" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />

                    {/* Valid - Create Account */}
                    <text x="620" y="415" fontSize="11" fontWeight="bold" fill="#2E7D32">Yes</text>
                    <rect x="540" y="420" width="180" height="80" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="630" y="445" textAnchor="middle" fontSize="12" fill="white">POST /auth/register</text>
                    <text x="630" y="465" textAnchor="middle" fontSize="11" fill="white">Hash password</text>
                    <text x="630" y="485" textAnchor="middle" fontSize="11" fill="white">Create user record</text>
                    <line x1="630" y1="390" x2="630" y2="420" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    {/* Yes - Login */}
                    <text x="280" y="225" fontSize="11" fontWeight="bold" fill="#2E7D32">Yes</text>
                    <rect x="100" y="190" width="180" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="190" y="215" textAnchor="middle" fontSize="12">Enter email &</text>
                    <text x="190" y="235" textAnchor="middle" fontSize="12">password</text>
                    <line x1="320" y1="220" x2="280" y2="220" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    {/* Validate Credentials */}
                    <path d="M 190 270 L 270 330 L 190 390 L 110 330 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="190" y="325" textAnchor="middle" fontSize="11" fontWeight="bold">Credentials</text>
                    <text x="190" y="340" textAnchor="middle" fontSize="11" fontWeight="bold">Valid?</text>
                    <line x1="190" y1="250" x2="190" y2="270" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    {/* Invalid Credentials */}
                    <text x="60" y="335" fontSize="11" fontWeight="bold" fill="#D32F2F">No</text>
                    <rect x="10" y="300" width="80" height="60" rx="8" fill="#FFCDD2" stroke="#D32F2F" strokeWidth="2" />
                    <text x="50" y="325" textAnchor="middle" fontSize="11" fill="#D32F2F">Show</text>
                    <text x="50" y="345" textAnchor="middle" fontSize="11" fill="#D32F2F">error</text>
                    <line x1="110" y1="330" x2="90" y2="330" stroke="#D32F2F" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <path d="M 50 300 L 50 220 L 100 220" stroke="#D32F2F" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />

                    {/* Valid Login */}
                    <text x="180" y="415" fontSize="11" fontWeight="bold" fill="#2E7D32">Yes</text>
                    <rect x="100" y="420" width="180" height="80" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="190" y="445" textAnchor="middle" fontSize="12" fill="white">POST /auth/login</text>
                    <text x="190" y="465" textAnchor="middle" fontSize="11" fill="white">Verify password</text>
                    <text x="190" y="485" textAnchor="middle" fontSize="11" fill="white">Create session</text>
                    <line x1="190" y1="390" x2="190" y2="420" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    {/* Converge paths */}
                    <line x1="190" y1="500" x2="190" y2="550" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="630" y1="500" x2="630" y2="550" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="190" y1="550" x2="400" y2="550" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="630" y1="550" x2="400" y2="550" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    {/* Check Role */}
                    <path d="M 400 560 L 480 620 L 400 680 L 320 620 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="400" y="615" textAnchor="middle" fontSize="11" fontWeight="bold">User Role?</text>
                    <text x="400" y="630" textAnchor="middle" fontSize="10">(admin/customer)</text>

                    {/* Customer Path */}
                    <text x="260" y="625" fontSize="11" fontWeight="bold" fill="#2E7D32">Customer</text>
                    <rect x="100" y="720" width="180" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="190" y="745" textAnchor="middle" fontSize="13">Redirect to</text>
                    <text x="190" y="765" textAnchor="middle" fontSize="13">/shop or /account</text>
                    <line x1="320" y1="620" x2="190" y2="720" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    {/* Admin Path */}
                    <text x="510" y="625" fontSize="11" fontWeight="bold" fill="#2E7D32">Admin</text>
                    <rect x="520" y="720" width="180" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="610" y="745" textAnchor="middle" fontSize="13">Redirect to</text>
                    <text x="610" y="765" textAnchor="middle" fontSize="13">/dashboard</text>
                    <line x1="480" y1="620" x2="610" y2="720" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    {/* Set Auth Context */}
                    <line x1="190" y1="780" x2="190" y2="820" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="610" y1="780" x2="610" y2="820" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="190" y1="820" x2="400" y2="820" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="610" y1="820" x2="400" y2="820" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />

                    <rect x="300" y="830" width="200" height="80" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="860" textAnchor="middle" fontSize="12" fill="white">Set AuthContext</text>
                    <text x="400" y="880" textAnchor="middle" fontSize="11" fill="white">Store user data</text>
                    <text x="400" y="895" textAnchor="middle" fontSize="11" fill="white">Enable navigation</text>

                    {/* End */}
                    <line x1="400" y1="910" x2="400" y2="950" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <ellipse cx="400" cy="970" rx="60" ry="25" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="978" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">END</text>

                    {/* Session Token Note */}
                    <rect x="520" y="1050" width="240" height="80" rx="8" fill="#FFF9C4" stroke="#F57C00" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="640" y="1075" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#F57C00">Security Note:</text>
                    <text x="640" y="1095" textAnchor="middle" fontSize="10" fill="#666">JWT tokens stored in</text>
                    <text x="640" y="1110" textAnchor="middle" fontSize="10" fill="#666">httpOnly cookies</text>
                    <text x="640" y="1125" textAnchor="middle" fontSize="10" fill="#666">Session expires after 7 days</text>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Shopping Flow */}
          <TabsContent value="shopping">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#2E7D32]" />
                  Product Browsing & Cart Flow
                </CardTitle>
                <CardDescription>
                  How customers browse products and add items to their cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <svg viewBox="0 0 900 1200" className="w-full h-auto" style={{ minHeight: '600px' }}>
                    <defs>
                      <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#2E7D32" />
                      </marker>
                    </defs>

                    {/* Start */}
                    <ellipse cx="450" cy="30" rx="60" ry="25" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="450" y="38" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">START</text>

                    {/* Visit Shop */}
                    <rect x="350" y="80" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="450" y="105" textAnchor="middle" fontSize="13">User visits /shop</text>
                    <text x="450" y="125" textAnchor="middle" fontSize="12">GET /products</text>
                    <line x1="450" y1="55" x2="450" y2="80" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />

                    {/* Load Products */}
                    <rect x="350" y="170" width="200" height="60" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="450" y="195" textAnchor="middle" fontSize="12" fill="white">Fetch product catalog</text>
                    <text x="450" y="215" textAnchor="middle" fontSize="11" fill="white">Display with filters</text>
                    <line x1="450" y1="140" x2="450" y2="170" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />

                    {/* Filter Decision */}
                    <path d="M 450 250 L 530 310 L 450 370 L 370 310 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="450" y="305" textAnchor="middle" fontSize="11" fontWeight="bold">Apply</text>
                    <text x="450" y="320" textAnchor="middle" fontSize="11" fontWeight="bold">Filters?</text>
                    <line x1="450" y1="230" x2="450" y2="250" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />

                    {/* Yes - Filter */}
                    <text x="560" y="315" fontSize="11" fontWeight="bold" fill="#2E7D32">Yes</text>
                    <rect x="600" y="280" width="160" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="680" y="305" textAnchor="middle" fontSize="12">Filter by category</text>
                    <text x="680" y="325" textAnchor="middle" fontSize="11">(Fruits/Vegetables)</text>
                    <line x1="530" y1="310" x2="600" y2="310" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />
                    <path d="M 680 280 L 680 200 L 550 200" stroke="#2E7D32" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead2)" />

                    {/* No - Browse */}
                    <text x="440" y="390" fontSize="11" fontWeight="bold" fill="#2E7D32">No</text>
                    <rect x="350" y="400" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="450" y="425" textAnchor="middle" fontSize="13">Browse products</text>
                    <text x="450" y="445" textAnchor="middle" fontSize="12">View details</text>
                    <line x1="450" y1="370" x2="450" y2="400" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />

                    {/* Product Selection */}
                    <path d="M 450 480 L 530 540 L 450 600 L 370 540 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="450" y="535" textAnchor="middle" fontSize="11" fontWeight="bold">Product</text>
                    <text x="450" y="550" textAnchor="middle" fontSize="11" fontWeight="bold">Selected?</text>
                    <line x1="450" y1="460" x2="450" y2="480" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />

                    {/* No - Continue Browsing */}
                    <text x="330" y="545" fontSize="11" fontWeight="bold" fill="#2E7D32">No</text>
                    <path d="M 370 540 L 310 540 L 310 430 L 350 430" stroke="#2E7D32" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead2)" />

                    {/* Yes - Select Quantity */}
                    <text x="540" y="545" fontSize="11" fontWeight="bold" fill="#2E7D32">Yes</text>
                    <rect x="600" y="510" width="180" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="690" y="535" textAnchor="middle" fontSize="12">Select quantity</text>
                    <text x="690" y="555" textAnchor="middle" fontSize="11">(input field)</text>
                    <line x1="530" y1="540" x2="600" y2="540" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />

                    {/* Add to Cart */}
                    <rect x="600" y="600" width="180" height="60" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="690" y="625" textAnchor="middle" fontSize="12" fill="white">Click "Add to Cart"</text>
                    <text x="690" y="645" textAnchor="middle" fontSize="11" fill="white">CartContext.addItem()</text>
                    <line x1="690" y1="570" x2="690" y2="600" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />

                    {/* Check Stock */}
                    <path d="M 690 680 L 770 740 L 690 800 L 610 740 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="690" y="735" textAnchor="middle" fontSize="11" fontWeight="bold">Stock</text>
                    <text x="690" y="750" textAnchor="middle" fontSize="11" fontWeight="bold">Available?</text>
                    <line x1="690" y1="660" x2="690" y2="680" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />

                    {/* No Stock */}
                    <text x="790" y="745" fontSize="11" fontWeight="bold" fill="#D32F2F">No</text>
                    <rect x="800" y="710" width="80" height="60" rx="8" fill="#FFCDD2" stroke="#D32F2F" strokeWidth="2" />
                    <text x="840" y="735" textAnchor="middle" fontSize="11" fill="#D32F2F">Show</text>
                    <text x="840" y="755" textAnchor="middle" fontSize="11" fill="#D32F2F">error</text>
                    <line x1="770" y1="740" x2="800" y2="740" stroke="#D32F2F" strokeWidth="2" markerEnd="url(#arrowhead2)" />
                    <path d="M 840 710 L 840 540 L 780 540" stroke="#D32F2F" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead2)" />

                    {/* Yes - Update Cart */}
                    <text x="680" y="820" fontSize="11" fontWeight="bold" fill="#2E7D32">Yes</text>
                    <rect x="600" y="830" width="180" height="80" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="690" y="860" textAnchor="middle" fontSize="12" fill="white">Update cart state</text>
                    <text x="690" y="880" textAnchor="middle" fontSize="11" fill="white">Show success toast</text>
                    <text x="690" y="895" textAnchor="middle" fontSize="11" fill="white">Update cart icon</text>
                    <line x1="690" y1="800" x2="690" y2="830" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />

                    {/* Continue Shopping? */}
                    <path d="M 450 940 L 530 1000 L 450 1060 L 370 1000 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="450" y="995" textAnchor="middle" fontSize="11" fontWeight="bold">Continue</text>
                    <text x="450" y="1010" textAnchor="middle" fontSize="11" fontWeight="bold">Shopping?</text>
                    <line x1="690" y1="910" x2="690" y2="1000" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="690" y1="1000" x2="530" y2="1000" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />

                    {/* Yes - Browse More */}
                    <text x="330" y="1005" fontSize="11" fontWeight="bold" fill="#2E7D32">Yes</text>
                    <path d="M 370 1000 L 270 1000 L 270 430 L 350 430" stroke="#2E7D32" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead2)" />

                    {/* No - View Cart */}
                    <text x="440" y="1080" fontSize="11" fontWeight="bold" fill="#2E7D32">No</text>
                    <rect x="350" y="1090" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="450" y="1115" textAnchor="middle" fontSize="13">Navigate to /cart</text>
                    <text x="450" y="1135" textAnchor="middle" fontSize="12">Review cart items</text>
                    <line x1="450" y1="1060" x2="450" y2="1090" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />

                    {/* End */}
                    <line x1="450" y1="1150" x2="450" y2="1190" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead2)" />
                    <ellipse cx="450" cy="1210" rx="60" ry="25" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="450" y="1218" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">END</text>

                    {/* Cart Context Note */}
                    <rect x="60" y="650" width="200" height="100" rx="8" fill="#FFF9C4" stroke="#F57C00" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="160" y="675" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#F57C00">Cart Storage:</text>
                    <text x="160" y="695" textAnchor="middle" fontSize="10" fill="#666">React Context</text>
                    <text x="160" y="710" textAnchor="middle" fontSize="10" fill="#666">localStorage backup</text>
                    <text x="160" y="725" textAnchor="middle" fontSize="10" fill="#666">Persists across sessions</text>
                    <text x="160" y="740" textAnchor="middle" fontSize="10" fill="#666">until checkout</text>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Checkout Flow */}
          <TabsContent value="checkout">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#2E7D32]" />
                  Checkout Process Flow
                </CardTitle>
                <CardDescription>
                  Complete checkout process from cart review to order confirmation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <svg viewBox="0 0 800 1500" className="w-full h-auto" style={{ minHeight: '750px' }}>
                    <defs>
                      <marker id="arrowhead3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#2E7D32" />
                      </marker>
                    </defs>

                    {/* Start */}
                    <ellipse cx="400" cy="30" rx="60" ry="25" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="38" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">START</text>

                    {/* View Cart */}
                    <rect x="300" y="80" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="400" y="105" textAnchor="middle" fontSize="13">User at /cart</text>
                    <text x="400" y="125" textAnchor="middle" fontSize="12">Review cart items</text>
                    <line x1="400" y1="55" x2="400" y2="80" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Cart Empty? */}
                    <path d="M 400 160 L 480 220 L 400 280 L 320 220 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="400" y="215" textAnchor="middle" fontSize="11" fontWeight="bold">Cart</text>
                    <text x="400" y="230" textAnchor="middle" fontSize="11" fontWeight="bold">Empty?</text>
                    <line x1="400" y1="140" x2="400" y2="160" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Yes - Redirect to Shop */}
                    <text x="510" y="225" fontSize="11" fontWeight="bold" fill="#D32F2F">Yes</text>
                    <rect x="540" y="190" width="140" height="60" rx="8" fill="#FFCDD2" stroke="#D32F2F" strokeWidth="2" />
                    <text x="610" y="215" textAnchor="middle" fontSize="12" fill="#D32F2F">Redirect to</text>
                    <text x="610" y="235" textAnchor="middle" fontSize="12" fill="#D32F2F">/shop</text>
                    <line x1="480" y1="220" x2="540" y2="220" stroke="#D32F2F" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* No - Check Auth */}
                    <text x="390" y="300" fontSize="11" fontWeight="bold" fill="#2E7D32">No</text>
                    <path d="M 400 300 L 480 360 L 400 420 L 320 360 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="400" y="355" textAnchor="middle" fontSize="11" fontWeight="bold">User</text>
                    <text x="400" y="370" textAnchor="middle" fontSize="11" fontWeight="bold">Logged In?</text>

                    {/* No - Redirect to Login */}
                    <text x="270" y="365" fontSize="11" fontWeight="bold" fill="#D32F2F">No</text>
                    <rect x="120" y="330" width="140" height="60" rx="8" fill="#FFCDD2" stroke="#D32F2F" strokeWidth="2" />
                    <text x="190" y="355" textAnchor="middle" fontSize="12" fill="#D32F2F">Redirect to</text>
                    <text x="190" y="375" textAnchor="middle" fontSize="12" fill="#D32F2F">/login</text>
                    <line x1="320" y1="360" x2="260" y2="360" stroke="#D32F2F" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Yes - Proceed to Checkout */}
                    <text x="390" y="440" fontSize="11" fontWeight="bold" fill="#2E7D32">Yes</text>
                    <rect x="300" y="450" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="400" y="475" textAnchor="middle" fontSize="13">Click "Proceed to</text>
                    <text x="400" y="495" textAnchor="middle" fontSize="13">Checkout"</text>
                    <line x1="400" y1="420" x2="400" y2="450" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Navigate to Checkout Page */}
                    <rect x="300" y="540" width="200" height="60" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="565" textAnchor="middle" fontSize="12" fill="white">Navigate to</text>
                    <text x="400" y="585" textAnchor="middle" fontSize="12" fill="white">/checkout</text>
                    <line x1="400" y1="510" x2="400" y2="540" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Verify Address */}
                    <rect x="300" y="630" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="400" y="655" textAnchor="middle" fontSize="12">Enter/Confirm</text>
                    <text x="400" y="675" textAnchor="middle" fontSize="12">delivery address</text>
                    <line x1="400" y1="600" x2="400" y2="630" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Address Valid? */}
                    <path d="M 400 710 L 480 770 L 400 830 L 320 770 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="400" y="765" textAnchor="middle" fontSize="11" fontWeight="bold">Address</text>
                    <text x="400" y="780" textAnchor="middle" fontSize="11" fontWeight="bold">Valid?</text>
                    <line x1="400" y1="690" x2="400" y2="710" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* No - Show Error */}
                    <text x="510" y="775" fontSize="11" fontWeight="bold" fill="#D32F2F">No</text>
                    <rect x="540" y="740" width="140" height="60" rx="8" fill="#FFCDD2" stroke="#D32F2F" strokeWidth="2" />
                    <text x="610" y="765" textAnchor="middle" fontSize="11" fill="#D32F2F">Show validation</text>
                    <text x="610" y="785" textAnchor="middle" fontSize="11" fill="#D32F2F">errors</text>
                    <line x1="480" y1="770" x2="540" y2="770" stroke="#D32F2F" strokeWidth="2" markerEnd="url(#arrowhead3)" />
                    <path d="M 610 740 L 610 660 L 500 660" stroke="#D32F2F" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead3)" />

                    {/* Yes - Select Payment Method */}
                    <text x="390" y="850" fontSize="11" fontWeight="bold" fill="#2E7D32">Yes</text>
                    <rect x="300" y="860" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="400" y="885" textAnchor="middle" fontSize="12">Select payment</text>
                    <text x="400" y="905" textAnchor="middle" fontSize="12">method</text>
                    <line x1="400" y1="830" x2="400" y2="860" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Enter Payment Details */}
                    <rect x="300" y="950" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="400" y="975" textAnchor="middle" fontSize="12">Enter payment</text>
                    <text x="400" y="995" textAnchor="middle" fontSize="12">details</text>
                    <line x1="400" y1="920" x2="400" y2="950" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Review Order */}
                    <rect x="300" y="1040" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="400" y="1065" textAnchor="middle" fontSize="12">Review order</text>
                    <text x="400" y="1085" textAnchor="middle" fontSize="12">summary & total</text>
                    <line x1="400" y1="1010" x2="400" y2="1040" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Click Place Order */}
                    <rect x="300" y="1130" width="200" height="60" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="1155" textAnchor="middle" fontSize="13" fill="white">Click "Place Order"</text>
                    <text x="400" y="1175" textAnchor="middle" fontSize="11" fill="white">POST /orders</text>
                    <line x1="400" y1="1100" x2="400" y2="1130" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Process Order */}
                    <rect x="300" y="1220" width="200" height="80" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="1250" textAnchor="middle" fontSize="11" fill="white">Create order records</text>
                    <text x="400" y="1270" textAnchor="middle" fontSize="11" fill="white">Update product stock</text>
                    <text x="400" y="1285" textAnchor="middle" fontSize="11" fill="white">Update customer stats</text>
                    <line x1="400" y1="1190" x2="400" y2="1220" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Clear Cart */}
                    <rect x="300" y="1330" width="200" height="60" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="1355" textAnchor="middle" fontSize="12" fill="white">Clear cart</text>
                    <text x="400" y="1375" textAnchor="middle" fontSize="11" fill="white">CartContext.clear()</text>
                    <line x1="400" y1="1300" x2="400" y2="1330" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* Show Confirmation */}
                    <rect x="300" y="1420" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="400" y="1445" textAnchor="middle" fontSize="12">Show order</text>
                    <text x="400" y="1465" textAnchor="middle" fontSize="12">confirmation</text>
                    <line x1="400" y1="1390" x2="400" y2="1420" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />

                    {/* End */}
                    <line x1="400" y1="1480" x2="400" y2="1520" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead3)" />
                    <ellipse cx="400" cy="1540" rx="60" ry="25" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="1548" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">END</text>

                    {/* Payment Note */}
                    <rect x="560" y="930" width="200" height="100" rx="8" fill="#FFF9C4" stroke="#F57C00" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="660" y="955" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#F57C00">Payment Processing:</text>
                    <text x="660" y="975" textAnchor="middle" fontSize="10" fill="#666">Payment gateway</text>
                    <text x="660" y="990" textAnchor="middle" fontSize="10" fill="#666">integration required</text>
                    <text x="660" y="1005" textAnchor="middle" fontSize="10" fill="#666">Mock payment for</text>
                    <text x="660" y="1020" textAnchor="middle" fontSize="10" fill="#666">development</text>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Order Processing - Add more tabs similarly */}
          <TabsContent value="order">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#2E7D32]" />
                  Order Fulfillment Flow
                </CardTitle>
                <CardDescription>
                  Order status tracking from pending to delivered/collected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <svg viewBox="0 0 1000 800" className="w-full h-auto" style={{ minHeight: '400px' }}>
                    <defs>
                      <marker id="arrowhead4" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#2E7D32" />
                      </marker>
                    </defs>

                    {/* Order Created */}
                    <rect x="50" y="100" width="140" height="80" rx="8" fill="#FFF9C4" stroke="#F57C00" strokeWidth="2" />
                    <text x="120" y="130" textAnchor="middle" fontSize="13" fontWeight="bold">PENDING</text>
                    <text x="120" y="150" textAnchor="middle" fontSize="11">Order created</text>
                    <text x="120" y="165" textAnchor="middle" fontSize="10">Payment pending</text>

                    {/* Arrow to Paid */}
                    <line x1="190" y1="140" x2="270" y2="140" stroke="#2E7D32" strokeWidth="3" markerEnd="url(#arrowhead4)" />
                    <text x="230" y="130" textAnchor="middle" fontSize="10" fill="#2E7D32">Payment</text>
                    <text x="230" y="155" textAnchor="middle" fontSize="10" fill="#2E7D32">received</text>

                    {/* Paid */}
                    <rect x="270" y="100" width="140" height="80" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="340" y="130" textAnchor="middle" fontSize="13" fontWeight="bold">PAID</text>
                    <text x="340" y="150" textAnchor="middle" fontSize="11">Payment confirmed</text>
                    <text x="340" y="165" textAnchor="middle" fontSize="10">Ready for processing</text>

                    {/* Arrow to Processing */}
                    <line x1="410" y1="140" x2="490" y2="140" stroke="#2E7D32" strokeWidth="3" markerEnd="url(#arrowhead4)" />
                    <text x="450" y="130" textAnchor="middle" fontSize="10" fill="#2E7D32">Admin</text>
                    <text x="450" y="155" textAnchor="middle" fontSize="10" fill="#2E7D32">prepares</text>

                    {/* Processing */}
                    <rect x="490" y="100" width="140" height="80" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="560" y="130" textAnchor="middle" fontSize="13" fontWeight="bold">PROCESSING</text>
                    <text x="560" y="150" textAnchor="middle" fontSize="11">Order being</text>
                    <text x="560" y="165" textAnchor="middle" fontSize="10">prepared</text>

                    {/* Arrow to Ready */}
                    <line x1="630" y1="140" x2="710" y2="140" stroke="#2E7D32" strokeWidth="3" markerEnd="url(#arrowhead4)" />
                    <text x="670" y="130" textAnchor="middle" fontSize="10" fill="#2E7D32">Order</text>
                    <text x="670" y="155" textAnchor="middle" fontSize="10" fill="#2E7D32">ready</text>

                    {/* Ready for Pickup/Delivery */}
                    <rect x="710" y="100" width="140" height="80" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="780" y="130" textAnchor="middle" fontSize="13" fontWeight="bold">READY</text>
                    <text x="780" y="150" textAnchor="middle" fontSize="11">Ready for</text>
                    <text x="780" y="165" textAnchor="middle" fontSize="10">pickup/delivery</text>

                    {/* Delivery Decision */}
                    <path d="M 780 200 L 860 260 L 780 320 L 700 260 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="780" y="255" textAnchor="middle" fontSize="11" fontWeight="bold">Delivery</text>
                    <text x="780" y="270" textAnchor="middle" fontSize="11" fontWeight="bold">Method?</text>

                    {/* Delivery Branch */}
                    <text x="880" y="265" fontSize="11" fontWeight="bold" fill="#2E7D32">Delivery</text>
                    <rect x="650" y="370" width="140" height="80" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="720" y="400" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">DELIVERED</text>
                    <text x="720" y="420" textAnchor="middle" fontSize="11" fill="white">Order delivered</text>
                    <text x="720" y="435" textAnchor="middle" fontSize="10" fill="white">to customer</text>
                    <line x1="860" y1="260" x2="900" y2="260" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="900" y1="260" x2="900" y2="410" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="900" y1="410" x2="790" y2="410" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead4)" />

                    {/* Pickup Branch */}
                    <text x="640" y="265" fontSize="11" fontWeight="bold" fill="#2E7D32">Pickup</text>
                    <rect x="490" y="370" width="140" height="80" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="560" y="400" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">COLLECTED</text>
                    <text x="560" y="420" textAnchor="middle" fontSize="11" fill="white">Customer picked</text>
                    <text x="560" y="435" textAnchor="middle" fontSize="10" fill="white">up order</text>
                    <line x1="700" y1="260" x2="660" y2="260" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="660" y1="260" x2="660" y2="410" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="660" y1="410" x2="630" y2="410" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead4)" />

                    {/* Converge */}
                    <line x1="560" y1="450" x2="560" y2="500" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="720" y1="450" x2="720" y2="500" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="560" y1="500" x2="640" y2="500" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead4)" />
                    <line x1="720" y1="500" x2="640" y2="500" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead4)" />

                    {/* Update Customer Stats */}
                    <rect x="500" y="520" width="280" height="80" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="640" y="550" textAnchor="middle" fontSize="12" fill="white">Update Customer Statistics</text>
                    <text x="640" y="570" textAnchor="middle" fontSize="11" fill="white">• Increment order_count</text>
                    <text x="640" y="585" textAnchor="middle" fontSize="11" fill="white">• Add to total_spend</text>
                    <text x="640" y="600" textAnchor="middle" fontSize="11" fill="white">• Recalculate loyalty tier</text>

                    {/* Complete */}
                    <ellipse cx="640" cy="660" rx="80" ry="30" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="640" y="670" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">COMPLETE</text>
                    <line x1="640" y1="600" x2="640" y2="630" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead4)" />

                    {/* Cancellation Path */}
                    <rect x="50" y="300" width="140" height="80" rx="8" fill="#FFCDD2" stroke="#D32F2F" strokeWidth="2" />
                    <text x="120" y="330" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#D32F2F">CANCELLED</text>
                    <text x="120" y="350" textAnchor="middle" fontSize="11" fill="#D32F2F">Order cancelled</text>
                    <text x="120" y="365" textAnchor="middle" fontSize="10" fill="#D32F2F">by user/admin</text>

                    {/* Cancel arrows */}
                    <line x1="120" y1="180" x2="120" y2="300" stroke="#D32F2F" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead4)" />
                    <text x="130" y="240" fontSize="10" fill="#D32F2F">Cancel</text>

                    {/* Refund Path */}
                    <rect x="230" y="300" width="140" height="80" rx="8" fill="#FFCDD2" stroke="#D32F2F" strokeWidth="2" />
                    <text x="300" y="330" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#D32F2F">REFUNDED</text>
                    <text x="300" y="350" textAnchor="middle" fontSize="11" fill="#D32F2F">Payment</text>
                    <text x="300" y="365" textAnchor="middle" fontSize="10" fill="#D32F2F">refunded</text>

                    <line x1="120" y1="380" x2="230" y2="340" stroke="#D32F2F" strokeWidth="2" markerEnd="url(#arrowhead4)" />
                    <text x="170" y="355" fontSize="10" fill="#D32F2F">Refund</text>

                    {/* Notes */}
                    <rect x="50" y="520" width="280" height="150" rx="8" fill="#FFF9C4" stroke="#F57C00" strokeWidth="2" strokeDasharray="5,5" />
                    <text x="190" y="545" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#F57C00">Status Change Triggers:</text>
                    <text x="190" y="565" textAnchor="middle" fontSize="10" fill="#666">• PENDING → PAID: Payment gateway webhook</text>
                    <text x="190" y="580" textAnchor="middle" fontSize="10" fill="#666">• PAID → PROCESSING: Admin action</text>
                    <text x="190" y="595" textAnchor="middle" fontSize="10" fill="#666">• PROCESSING → READY: Admin action</text>
                    <text x="190" y="610" textAnchor="middle" fontSize="10" fill="#666">• READY → DELIVERED: Admin/driver</text>
                    <text x="190" y="625" textAnchor="middle" fontSize="10" fill="#666">• READY → COLLECTED: Admin confirms</text>
                    <text x="190" y="640" textAnchor="middle" fontSize="10" fill="#666">• Any → CANCELLED: User/admin</text>
                    <text x="190" y="655" textAnchor="middle" fontSize="10" fill="#666">• CANCELLED → REFUNDED: Admin</text>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Login Flow */}
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#2E7D32]" />
                  Admin Dashboard Access Flow
                </CardTitle>
                <CardDescription>
                  Admin authentication and role-based access control
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center text-gray-500">
                  <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Similar to User Authentication Flow</p>
                  <p className="text-sm">
                    See "Auth" tab for complete authentication process.
                    <br />
                    Additional checks:
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-left max-w-md mx-auto">
                    <div className="flex items-start gap-2">
                      <Badge className="bg-[#2E7D32] mt-0.5">1</Badge>
                      <span>Verify user.role is 'admin', 'owner', or 'manager'</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-[#2E7D32] mt-0.5">2</Badge>
                      <span>Load admin permissions from admins table</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-[#2E7D32] mt-0.5">3</Badge>
                      <span>Check role-based permissions for each dashboard section</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-[#2E7D32] mt-0.5">4</Badge>
                      <span>Update last_login timestamp in admins table</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge className="bg-[#2E7D32] mt-0.5">5</Badge>
                      <span>Redirect to /dashboard with appropriate permissions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Management */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#2E7D32]" />
                  Inventory Management Flow
                </CardTitle>
                <CardDescription>
                  Stock level updates and low stock alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-[#A5D6A7]/20 rounded-lg border-2 border-[#2E7D32]">
                    <h3 className="font-semibold text-[#1B5E20] mb-2">Automatic Stock Updates</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Customer completes order (status: PAID)</li>
                      <li>For each order_item, reduce product.stock_level by quantity</li>
                      <li>Check if stock_level {"<="} low_stock_threshold</li>
                      <li>If true, flag product with low stock alert</li>
                      <li>Admin sees alert in Dashboard → Inventory section</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-[#FFF9C4] rounded-lg border-2 border-[#F57C00]">
                    <h3 className="font-semibold text-[#F57C00] mb-2">Manual Stock Adjustment</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Admin navigates to Dashboard → Inventory</li>
                      <li>Clicks "Edit" on product row</li>
                      <li>Updates stock_level field</li>
                      <li>Clicks "Save"</li>
                      <li>PUT /products/:id/stock</li>
                      <li>Database updates product record</li>
                      <li>Low stock alert auto-recalculated</li>
                    </ol>
                  </div>

                  <div className="p-4 bg-[#FFCDD2] rounded-lg border-2 border-[#D32F2F]">
                    <h3 className="font-semibold text-[#D32F2F] mb-2">Out of Stock Handling</h3>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Product stock_level reaches 0</li>
                      <li>Product automatically marked as not in stock</li>
                      <li>"Add to Cart" button disabled on frontend</li>
                      <li>"Out of Stock" badge displayed</li>
                      <li>Admin receives critical stock alert</li>
                      <li>Admin restocks and updates stock_level</li>
                      <li>Product automatically available again</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loyalty Tier Updates */}
          <TabsContent value="loyalty">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#2E7D32]" />
                  Loyalty Tier Calculation Flow
                </CardTitle>
                <CardDescription>
                  Automatic customer tier upgrades based on spending
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <svg viewBox="0 0 800 900" className="w-full h-auto" style={{ minHeight: '450px' }}>
                    <defs>
                      <marker id="arrowhead5" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#2E7D32" />
                      </marker>
                    </defs>

                    {/* Trigger Event */}
                    <rect x="300" y="50" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="400" y="75" textAnchor="middle" fontSize="12">Order Status Changed</text>
                    <text x="400" y="95" textAnchor="middle" fontSize="11">to DELIVERED/COLLECTED</text>

                    {/* Update Total Spend */}
                    <rect x="300" y="140" width="200" height="80" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="170" textAnchor="middle" fontSize="11" fill="white">UPDATE customers SET</text>
                    <text x="400" y="190" textAnchor="middle" fontSize="11" fill="white">total_spend += order.total</text>
                    <text x="400" y="205" textAnchor="middle" fontSize="11" fill="white">order_count += 1</text>
                    <line x1="400" y1="110" x2="400" y2="140" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead5)" />

                    {/* Calculate Tier */}
                    <rect x="300" y="250" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="400" y="275" textAnchor="middle" fontSize="12">Calculate new</text>
                    <text x="400" y="295" textAnchor="middle" fontSize="12">loyalty tier</text>
                    <line x1="400" y1="220" x2="400" y2="250" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead5)" />

                    {/* Tier Decision */}
                    <path d="M 400 330 L 480 390 L 400 450 L 320 390 Z" fill="#FFE082" stroke="#F57C00" strokeWidth="2" />
                    <text x="400" y="385" textAnchor="middle" fontSize="11" fontWeight="bold">Total Spend</text>
                    <text x="400" y="400" textAnchor="middle" fontSize="11" fontWeight="bold">Amount?</text>
                    <line x1="400" y1="310" x2="400" y2="330" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead5)" />

                    {/* Bronze */}
                    <text x="240" y="395" fontSize="11" fontWeight="bold" fill="#CD7F32">$0-99</text>
                    <rect x="80" y="520" width="120" height="60" rx="8" fill="#CD7F32" stroke="#8B4513" strokeWidth="2" />
                    <text x="140" y="545" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">BRONZE</text>
                    <text x="140" y="565" textAnchor="middle" fontSize="10" fill="white">loyalty_tier</text>
                    <line x1="320" y1="390" x2="140" y2="520" stroke="#CD7F32" strokeWidth="2" markerEnd="url(#arrowhead5)" />

                    {/* Silver */}
                    <text x="240" y="350" fontSize="11" fontWeight="bold" fill="#C0C0C0">$100-199</text>
                    <rect x="220" y="520" width="120" height="60" rx="8" fill="#C0C0C0" stroke="#808080" strokeWidth="2" />
                    <text x="280" y="545" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">SILVER</text>
                    <text x="280" y="565" textAnchor="middle" fontSize="10" fill="white">loyalty_tier</text>
                    <line x1="360" y1="430" x2="280" y2="520" stroke="#C0C0C0" strokeWidth="2" markerEnd="url(#arrowhead5)" />

                    {/* Gold */}
                    <text x="560" y="350" fontSize="11" fontWeight="bold" fill="#FFD700">$200-399</text>
                    <rect x="460" y="520" width="120" height="60" rx="8" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
                    <text x="520" y="545" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">GOLD</text>
                    <text x="520" y="565" textAnchor="middle" fontSize="10" fill="white">loyalty_tier</text>
                    <line x1="440" y1="430" x2="520" y2="520" stroke="#FFD700" strokeWidth="2" markerEnd="url(#arrowhead5)" />

                    {/* Platinum */}
                    <text x="560" y="395" fontSize="11" fontWeight="bold" fill="#2E7D32">$400+</text>
                    <rect x="600" y="520" width="120" height="60" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="660" y="545" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white">PLATINUM</text>
                    <text x="660" y="565" textAnchor="middle" fontSize="10" fill="white">loyalty_tier</text>
                    <line x1="480" y1="390" x2="660" y2="520" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead5)" />

                    {/* Converge */}
                    <line x1="140" y1="580" x2="140" y2="640" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="280" y1="580" x2="280" y2="640" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="520" y1="580" x2="520" y2="640" stroke="#2E7D32" strokeWidth="2" />
                    <line x1="660" y1="580" x2="660" y2="640" stroke="#2E7D32" strokeWidth="2" />
                    
                    <line x1="140" y1="640" x2="400" y2="640" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead5)" />
                    <line x1="280" y1="640" x2="400" y2="640" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead5)" />
                    <line x1="520" y1="640" x2="400" y2="640" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead5)" />
                    <line x1="660" y1="640" x2="400" y2="640" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead5)" />

                    {/* Update Database */}
                    <rect x="300" y="660" width="200" height="80" rx="8" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="690" textAnchor="middle" fontSize="11" fill="white">UPDATE customers</text>
                    <text x="400" y="710" textAnchor="middle" fontSize="11" fill="white">SET loyalty_tier,</text>
                    <text x="400" y="725" textAnchor="middle" fontSize="11" fill="white">avg_order_value</text>

                    {/* Notification */}
                    <rect x="300" y="770" width="200" height="60" rx="8" fill="#A5D6A7" stroke="#2E7D32" strokeWidth="2" />
                    <text x="400" y="795" textAnchor="middle" fontSize="12">Send tier upgrade</text>
                    <text x="400" y="815" textAnchor="middle" fontSize="11">notification (if changed)</text>
                    <line x1="400" y1="740" x2="400" y2="770" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead5)" />

                    {/* End */}
                    <ellipse cx="400" cy="870" rx="60" ry="25" fill="#2E7D32" stroke="#1B5E20" strokeWidth="2" />
                    <text x="400" y="878" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">END</text>
                    <line x1="400" y1="830" x2="400" y2="845" stroke="#2E7D32" strokeWidth="2" markerEnd="url(#arrowhead5)" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Processing */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#2E7D32]" />
                  Payment Processing Flow
                </CardTitle>
                <CardDescription>
                  Payment gateway integration and transaction handling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-[#FFF9C4] rounded-lg border-2 border-[#F57C00]">
                    <h3 className="font-semibold text-[#F57C00] mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Payment Gateway Integration Required
                    </h3>
                    <p className="text-sm mb-3">
                      Production implementation requires integration with payment providers such as:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Stripe</li>
                      <li>PayPal</li>
                      <li>Square</li>
                      <li>Authorize.Net</li>
                    </ul>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border-2 border-[#2E7D32]">
                      <h3 className="font-semibold text-[#1B5E20] mb-3">Payment Flow Steps</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>User enters payment details</li>
                        <li>Frontend validates card format</li>
                        <li>Submit to payment gateway API</li>
                        <li>Gateway processes transaction</li>
                        <li>Receive webhook with status</li>
                        <li>Update order.payment_status</li>
                        <li>If success: status → PAID</li>
                        <li>If failed: show error message</li>
                      </ol>
                    </div>

                    <div className="p-4 bg-white rounded-lg border-2 border-[#2E7D32]">
                      <h3 className="font-semibold text-[#1B5E20] mb-3">Security Measures</h3>
                      <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>Never store raw card numbers</li>
                        <li>Use tokenization</li>
                        <li>PCI DSS compliance</li>
                        <li>SSL/TLS encryption</li>
                        <li>3D Secure authentication</li>
                        <li>Fraud detection algorithms</li>
                        <li>Transaction logging</li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-4 bg-[#A5D6A7]/20 rounded-lg border-2 border-[#2E7D32]">
                    <h3 className="font-semibold text-[#1B5E20] mb-3">Current Mock Implementation</h3>
                    <p className="text-sm mb-2">
                      For development purposes, the system currently uses mock payment processing:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>All payments automatically succeed</li>
                      <li>No actual payment gateway calls</li>
                      <li>Order status immediately set to PAID</li>
                      <li>Simulated payment method storage</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
