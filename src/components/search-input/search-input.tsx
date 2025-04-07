import { X } from 'lucide-react';
import './search-input.scss';
import * as React from "react";


/////////
/////////


interface SearchInputProps {
    searchActive: boolean,
    onChange: (input: string) => void,
    showSearchInput: () => void,
    hideSearchInput: () => void,
}

export const SearchInput = (props: SearchInputProps) => {
    const searchInputElRef = React.useRef<HTMLInputElement>(null);
    const lastClickedInCardBrowserRef = React.useRef<boolean>(true);
    
    React.useEffect( () => {    

        // Listen to document for any interactions and remember if it occured within the card browser area.
        document.addEventListener('pointerdown', (event) => {
            const cardBrowserEl = (event.target as HTMLElement)?.closest('.ddc_pb_browser');
            if(cardBrowserEl) {
                lastClickedInCardBrowserRef.current = true;
            } else {
                lastClickedInCardBrowserRef.current = false;
            }
        });

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    });

    React.useEffect( () => {
        clearSearchStr();
        if(props.searchActive) {
            searchInputElRef.current?.focus();
        }
    }, [props.searchActive])

    const handleKeyPress = (event: KeyboardEvent) => {
        if(!lastClickedInCardBrowserRef.current) return;
        
        const cardBrowserEl = (event.target as HTMLElement)?.closest('.ddc_pb_browser');
        const activeDomElName = document.activeElement?.tagName;
        if(!cardBrowserEl?.contains(document.activeElement) && activeDomElName === 'INPUT') return; // Bail if there's an active input outside of the card browser view

        if(event.key === 'Escape') {
            clearSearchStr();
            props.hideSearchInput();
            return;
        }

        if(document.activeElement === searchInputElRef.current) return; // Bail if search box is already active

        if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9]/)) {
            // Focus the search box so it can handle the rest.
            // Seams to also pass first typed letter as well
            searchInputElRef.current?.focus();
            props.showSearchInput();
        };

    };


    /////////

    return <>
        <div
            className = 'ddc_pb_search-input-container'
            style = {{
                display: props.searchActive ? 'flex' : 'none',
            }}
        >
            <input
                ref = {searchInputElRef}
                className = 'ddc_pb_search-input'
                onChange = {(e) => props.onChange(e.currentTarget.value)}
                onBlur = {() => {
                    if(searchInputElRef.current) {
                        if(searchInputElRef.current.value.trim() === '') {
                            clearSearchStr();
                        }
                    }
                }}
            />
            <button
                className = 'ddc_pb_search-clear-btn'
                onClick = {() => {
                    clearSearchStr();
                    props.hideSearchInput();
                }}
            >
                <X size={20} />
            </button>
        </div>
    </>

    /////////
    /////////

    function clearSearchStr() {
        if(searchInputElRef.current) {
            searchInputElRef.current.value = '';
        }
        props.onChange('');
    }
}