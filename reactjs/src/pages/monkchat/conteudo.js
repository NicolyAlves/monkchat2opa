import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoadingBar from 'react-top-loading-bar'
 
import { ContainerConteudo } from './conteudo.styled'
import { ChatButton, ChatInput, ChatTextArea } from '../../components/outros/inputs'

import { useState, useRef } from 'react';

import Cookies from 'js-cookie'
import { useHistory } from 'react-router-dom';

import Api from '../../service/api';
const api = new Api();


export default function Conteudo() {
    const [idAlterando, setIdAlterando] = useState(0); // usestate 030/09 
    const [chat, setChat] = useState([]);
    const [sala, setSala] = useState('');
    const [usu, setUsu] = useState('');
    const [msg, setMsg] = useState('')

    const loading = useRef(null);

    const navigation = useHistory();

    let usuarioLogado = Cookies.get('usuario-logado');
    if (usuarioLogado == null)
    navigation.push('/')


    const validarResposta = (resp) => {
        if (!resp.erro)
            return true;
        toast.error(`${resp.erro}`);
        return false;
    }

    const carregarMensagens = async () => {
        loading.current.continuousStart();

        const mensagens = await api.listarMensagens(sala);
        if (validarResposta(mensagens))
            setChat(mensagens);

        loading.current.complete();
    }

    const enviarMensagem = async (event) => { // /atualizado enviar
        
        if  (event.type === "keypress" && (!event.ctrlKey || event.charCode !== 13))
        return;

        if (idAlterando > 0) {
            const resp = await api.alterarMensagem(idAlterando, msg);
            if (!validarResposta(resp))
            return;

            toast.dark("💕 Mensagem altearda com sucesso!");
            setIdAlterando(0);
            setMsg('');

        } else {
        const resp = await api.inserirMensagem(sala, usu, msg);
        if(!validarResposta(resp)) 
            return;
        
        toast.dark('💕 Mensagem enviada com sucesso!');
        }
        await carregarMensagens();
    }

    const inserirUsuario = async () => {
        const resp = await api.inserirUsuario(usu);
        if (!validarResposta(resp)) 
            return;
        
        toast.dark('💕 Usuário cadastrado!');
        await carregarMensagens();
    }

    const inserirSala = async () => {
        const resp = await api.inserirSala(sala);
        if (!validarResposta(resp)) 
            return;
        
        toast.dark('💕 Sala cadastrada!');
        await carregarMensagens();
    }
    
    const remover = async (id) => {
    const r = await api.removerMensagem(id)       
    if (!validarResposta(r)) 
    return;

    toast.dark('💕 Mensagem apagada!');
    await carregarMensagens();
    }

    const editar = async (item) => { // funcao 030/9
        setMsg(item.ds_mensagem);
        setIdAlterando(item.id_chat);
    }

    return (
        <ContainerConteudo>
            <ToastContainer />
            <LoadingBar color="red" ref={loading} />
            <div className="container-form">
                <div className="box-sala">
                    <div>
                        <div className="label">Sala</div>
                        <ChatInput value={sala} onChange={e => setSala(e.target.value)} />
                    </div>
                    <div>
                        <div className="label">Nick</div>
                        <ChatInput value={usu} onChange={e => setUsu(e.target.value)} />
                    </div>
                    <div>
                        <ChatButton onClick={inserirSala}> Criar </ChatButton>
                        <ChatButton onClick={inserirUsuario}> Entrar </ChatButton>
                    </div>
                </div>
                <div className="box-mensagem">
                    <div className="label">Mensagem</div>
                    <ChatTextArea value={msg} onChange={e => setMsg(e.target.value)} />
                    <ChatButton onClick={enviarMensagem} className="btn-enviar"> Enviar </ChatButton>
                </div>
            </div>
            
            <div className="container-chat">
                
                <img onClick={carregarMensagens}
                   className="chat-atualizar"
                         src="/assets/images/atualizar.png" alt="" />
                
                <div className="chat">
                    {chat.map(x =>
                        <div key={x.id_chat}>
                            <div className="chat-message">
                                <div><img onClick={() => editar(x)} src="/assets/images/alterar.svg" alt="" style={{cursor: 'pointer'}} /></div> 
                                <div><img onClick={() => remover(x.id_chat) } src="/assets/images/bin_delete_recycle_remove_trash_icon_123296 (1).svg" alt="" style={ {cursor: 'pointer'} }/></div>
                                <div>({new Date(x.dt_mensagem.replace('Z', '')).toLocaleTimeString()})</div>
                                <div><b>{x.tb_usuario.nm_usuario}</b> fala para <b>Todos</b>:</div>
                                <div> {x.ds_mensagem} </div>
                            </div>
                        </div>
                    )}
                    
                </div>
            </div>
        </ContainerConteudo>
    )
}