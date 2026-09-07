// Test component to verify logo displays correctly
import { Logo } from './Logo'

export function LogoTest() {
  return (
    <div className="p-8 space-y-8 bg-gray-50">
      <h2 className="text-2xl font-bold">Logo Test</h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-white rounded border">
          <h3 className="text-lg font-semibold mb-2">Small Logo</h3>
          <Logo size="sm" />
        </div>
        
        <div className="p-4 bg-white rounded border">
          <h3 className="text-lg font-semibold mb-2">Medium Logo</h3>
          <Logo size="md" />
        </div>
        
        <div className="p-4 bg-white rounded border">
          <h3 className="text-lg font-semibold mb-2">Large Logo</h3>
          <Logo size="lg" />
        </div>
        
        <div className="p-4 bg-gray-900 rounded border">
          <h3 className="text-lg font-semibold mb-2 text-white">Logo on Dark Background</h3>
          <Logo size="md" className="text-white" />
        </div>
      </div>
    </div>
  )
}