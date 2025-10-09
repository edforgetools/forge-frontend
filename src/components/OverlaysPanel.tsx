import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogoOverlay } from "./LogoOverlay";
import { TextOverlay } from "./TextOverlay";

export function OverlaysPanel() {
  return (
    <div className="p-6">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Text</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="mt-4">
          <TextOverlay />
        </TabsContent>

        <TabsContent value="logo" className="mt-4">
          <LogoOverlay />
        </TabsContent>
      </Tabs>
    </div>
  );
}
