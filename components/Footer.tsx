import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold mb-4">trustBank</h3>
            <p className="text-sm">Your trusted platform for simple, secure, and fast cryptocurrency trading.</p>
          </div>
          <div>
            <h3 className="font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/market">Market</Link></li>
              <li><Link href="/trade">Trade</Link></li>
              <li><Link href="/calculator">Calculator</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link href="/about/vision">Vision</Link></li>
              <li><Link href="/about/mission">Mission</Link></li>
              <li><Link href="/about/blog">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link href="/about/faq">FAQ</Link></li>
              <li><Link href="/about/contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>&copy; 2024 trustBank. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}