import {SearchIcon} from "@/src/components/Icons";
import {Input} from "@heroui/input";
import * as React from "react";

type InputProps = React.ComponentProps<typeof Input>;

export const SearchBar = ({
                              placeholder = "Search Board Games",
                              size = "lg",
                              radius = "full",
                              classNames,
                              ...props
                          }: InputProps) => (
    <Input
        aria-label="Search"
        type="search"
        labelPlacement="outside"
        placeholder={placeholder}
        size={size as any}
        radius={radius as any}
        classNames={{
            inputWrapper: "bg-default-100",
            input: "text-sm",
            ...classNames,
        }}
        startContent={
            <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0"/>
        }
        {...props}
    />
);
