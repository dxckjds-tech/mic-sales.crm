import {useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {CrmProvider,useCrm} from './crm/crm-context';
import {Shell} from './crm/components/Shell';
import './crm/crm.css';
import './detail.css';
function Detail(){const crm=useCrm();useEffect(()=>{crm.openDetail(new URLSearchParams(location.search).get('id')||'youlaite')},[]);return <Shell/>}
createRoot(document.getElementById('root')!).render(<CrmProvider><Detail/></CrmProvider>);
