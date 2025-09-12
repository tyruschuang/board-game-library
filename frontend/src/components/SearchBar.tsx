import {SearchIcon} from "@/src/components/icons";
import { Input } from "@heroui/input";

export const SearchBar = () => (
    <Input
        aria-label="Search"
        classNames={{
            inputWrapper: "bg-default-100",
            input: "text-sm",
        }}
        labelPlacement="outside"
        placeholder="Search Board Games"
        startContent={
            <SearchIcon
                className="text-base text-default-400 pointer-events-none flex-shrink-0"/>
        }
        type="search"
    />
);