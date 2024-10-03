import { CornerLeftUp } from 'lucide-react';
import './search-input.scss';
import { TFolder } from "obsidian";
import * as React from "react";
import classNames from 'classnames';


/////////
/////////


interface SearchInputProps {
    onChange: (input: string) => void,
}

export const SearchInput = (props: SearchInputProps) => {
    const searchInputElRef = React.useRef<HTMLInputElement>(null);
    const cardBrowserActiveRef = React.useRef<boolean>(true);

    
    React.useEffect( () => {    

        // Listen to document for any interactions and remember if it occured within the card browser area.
        document.addEventListener('pointerdown', (event) => {
            const cardBrowserEl = (event.target as HTMLElement)?.closest('.ddc_pb_browser');
            if(cardBrowserEl) {
                cardBrowserActiveRef.current = true;
            } else {
                cardBrowserActiveRef.current = false;
            }
        });

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    })

    const handleKeyPress = (event: KeyboardEvent) => {
        if(!cardBrowserActiveRef.current) return;
        if(document.activeElement === searchInputElRef.current) return; // bail if search box is already active

        if (event.key.match(/[a-zA-Z0-9]/)) {
            // Focus the search box so it can handle the rest.
            // Seams to also pass first typed letter as well
            searchInputElRef.current?.focus();
        };

    };


    /////////

    return <>
        <div
            className = 'ddc_pb_search-input-container'
        >
            <input
                ref = {searchInputElRef}
                className = 'ddc_pb_search-input'
                onChange = {(e) => props.onChange(e.currentTarget.value)}
            />
        </div>
    </>
}