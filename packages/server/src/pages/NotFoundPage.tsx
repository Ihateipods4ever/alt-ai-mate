import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/**
 * A 404 Not Found page for undefined routes.
 */
function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-9xl font-bold text-primary">404</h1>
            <p className="text-2xl font-semibold mt-4">Page Not Found</p>
            <p className="text-muted-foreground mt-2">The page you are looking for does not exist.</p>
            <Link to="/">
                <Button className="mt-6">Go to Dashboard</Button>
            </Link>
        </div>
    );
}

export default NotFoundPage;