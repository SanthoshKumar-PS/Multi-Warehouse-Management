import type { Supplier } from "@/types/TableTypes"
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "../ui/button";
import { Check, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

type SupplierSelectorProps = {
    suppliers: Supplier[];
    selectedSupplierId: number | null;
    onSelect:(supplierId: number) => void;
    onAddSupplier: (supplier: Supplier) => void;
}
const SupplierSelector = ({suppliers, selectedSupplierId, onSelect, onAddSupplier} : SupplierSelectorProps) => {
    const [open, setOpen] = useState<boolean>(false);
    const [search, setSearch] = useState<string>("");
    const [addOpen, setAddOpen] = useState<boolean>(false); 

    const [form, setForm] = useState({
        name: "", contactPerson: "", phone: "", email: "", address: "", city: "", state: "", country: "", gstNumber: ""
    });

    const selectedSupplier = suppliers.find(s => s.id===selectedSupplierId);

    const filteredSuppliers = useMemo(()=> {
        if(!search) return suppliers;
        const q = search.trim().toLowerCase();

        return suppliers.filter(s => 
            s.name.toLowerCase().includes(q) || 
            s.contactPerson?.toLowerCase().includes(q) ||
            s.phone?.toLowerCase().includes(q)
        );
    },[suppliers, search])
  
  const handleSelect = (id:number) => {
    onSelect(id);
    setOpen(false);
    setSearch("");
  }

  const handleAddSubmit = () => {
    console.log("Form data to create supplier: ", form);
    // onAddSupplier()
    // reset form
    setAddOpen(false);
    setOpen(false);
  }

  const updateForm = (field:string, val:string) => setForm(p => ({...p, [field]:val}))
  
    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant='outline'
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between font-normal"
                    >
                        {selectedSupplier? (
                            <span>{selectedSupplier.name}</span>
                        ) : (
                            <span className="text-gray-800">Select Supplier</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    {/* Search */}
                    <div className="flex items-center border-b px-3">
                        <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500"/>
                        <input
                            placeholder="Search supplier..."
                            value= {search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-500"
                        />
                    </div>

                    {/* Suppliers List */}
                    <ScrollArea className="h-60 ">
                        {filteredSuppliers.length==0? (
                            <p className="py-6 text-center text-sm text-gray-500">No suppliers found.</p>
                        ) : (
                            <div className="p-1">
                                {filteredSuppliers.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleSelect(s.id)}
                                        className={cn(
                                            "flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm transition-colors hover:bg-gray-50/50",
                                            selectedSupplierId===s.id && "bg-gray-50"
                                        )}
                                    >
                                        <Check className={cn(
                                            "h-4 w-4 shrink-0",
                                            selectedSupplierId===s.id? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium truncate">{s.name}</span>
                                                {/* TODO: If isActive add some  */}
                                            </div>
                                            {(s.contactPerson || s.phone) && (
                                                <p className="text-sm text-gray-500 truncate">
                                                    {s.contactPerson ?? s.phone}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {/* Add new */}
                    <div className="border-t p-1">
                        <button
                            onClick={()=> { setAddOpen(true); setOpen(false); }}
                            className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm text-blue-500 transition-colors hover:bg-gray-50"
                        >
                            <Plus className="h-4 w-4"/>
                            Add Supplier
                        </button>
                    </div>

                </PopoverContent>
            </Popover>

            {/* Add Supplier Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Supplier</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                        <div className="grid gap-1.5">
                            <Label>Name <span className="text-destructive">*</span></Label>
                            <Input value={form.name} onChange={(e) => updateForm("name", e.target.value)} required placeholder="Supplier name" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>Contact Person</Label>
                                <Input value={form.contactPerson} onChange={(e) => updateForm("contactPerson", e.target.value)} placeholder="Name" />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Phone</Label>
                                <Input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="+91…" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                                <Label>Email</Label>
                                <Input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="email@example.com" />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>GST Number</Label>
                                <Input value={form.gstNumber} onChange={(e) => updateForm("gstNumber", e.target.value)} placeholder="GSTIN" />
                            </div>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Address</Label>
                            <Input value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="Street address" />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="grid gap-1.5">
                                <Label>City</Label>
                                <Input value={form.city} onChange={(e) => updateForm("city", e.target.value)} placeholder="City" />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>State</Label>
                                <Input value={form.state} onChange={(e) => updateForm("state", e.target.value)} placeholder="State" />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Country</Label>
                                <Input value={form.country} onChange={(e) => updateForm("country", e.target.value)} placeholder="India" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="w-full flex items-center justify-between gap-2">
                        <Button variant='outline' className="flex-1" onClick={()=> setAddOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSubmit} className="flex-1" disabled={!form.name.trim()}>
                            <Plus className="mr-2 h-4 w-4"/>
                            Add Supplier
                        </Button>
                    </DialogFooter>

                </DialogContent>

            </Dialog>
        </>
  )
}

export default SupplierSelector