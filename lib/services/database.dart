import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/evento_model.dart';
import '../models/usuario_model.dart';
import '../models/ata_model.dart';
import '../models/financeiro_model.dart';

class DatabaseService {
  final CollectionReference eventosCollection = FirebaseFirestore.instance.collection('eventos');
  final CollectionReference atasCollection = FirebaseFirestore.instance.collection('atas');
  final CollectionReference usuariosCollection = FirebaseFirestore.instance.collection('usuarios');
  final CollectionReference financeiroCollection = FirebaseFirestore.instance.collection('financeiro');

  // Getter para a HomeScreen (O QUE ESTAVA FALTANDO)
  Stream<List<Evento>> get eventos {
    return eventosCollection.snapshots().map((snapshot) {
      return snapshot.docs.map((doc) => Evento.fromFirestore(doc)).toList();
    });
  }

  // Adiciona evento e cria a ata vinculada
  Future<void> addEvento(String nome, String descricao, DateTime data, String local) async {
    String dataFormatada = "${data.day.toString().padLeft(2, '0')}/${data.month.toString().padLeft(2, '0')}/${data.year}";

    await eventosCollection.add({
      'nome': nome,
      'descricao': descricao,
      'local': local,
      'data': dataFormatada,
      'presencas': [],
      'criadoEm': FieldValue.serverTimestamp(),
    });

    await atasCollection.add({
      'titulo': "Ata: $nome",
      'data': dataFormatada,
      'local': local,
      'conteudo': descricao,
      'quantidadePresentes': 0,
      'nomesPresentes': [],
      'criadoEm': FieldValue.serverTimestamp(),
    });
  }

  // Marca presença e sincroniza nomes na Ata
  Future<void> marcarPresenca(String eventoId, List<String> listaIds, String nomeEvento) async {
    await eventosCollection.doc(eventoId).update({'presencas': listaIds});

    List<String> nomesDosPresentes = [];
    var usuariosSnap = await usuariosCollection.get();
    
    for (var doc in usuariosSnap.docs) {
      if (listaIds.contains(doc.id)) {
        final data = doc.data() as Map<String, dynamic>;
        nomesDosPresentes.add(data['nome'] ?? 'Sem nome');
      }
    }

    var ataQuery = await atasCollection.where('titulo', isEqualTo: "Ata: $nomeEvento").get();
    if (ataQuery.docs.isNotEmpty) {
      await atasCollection.doc(ataQuery.docs.first.id).update({
        'quantidadePresentes': listaIds.length,
        'nomesPresentes': nomesDosPresentes,
      });
    }
  }

  Stream<List<AtaModel>> get atas {
    return atasCollection
        .orderBy('criadoEm', descending: true) 
        .snapshots()
        .map((snapshot) =>
            snapshot.docs.map((doc) => AtaModel.fromFirestore(doc)).toList());
  }

  Stream<List<UsuarioModel>> get membros {
    return usuariosCollection.snapshots().map((snapshot) =>
        snapshot.docs.map((doc) => UsuarioModel.fromFirestore(doc)).toList());
  }

  // Função para editar o conteúdo da ata
  Future<void> atualizarConteudoAta(String ataId, String novoConteudo) async {
    await atasCollection.doc(ataId).update({
      'conteudo': novoConteudo,
    });
  }

  Stream<List<FinanceiroModel>> get transacoes {
    return financeiroCollection
        .orderBy('criadoEm', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map((doc) => FinanceiroModel.fromFirestore(doc))
            .toList());
  }

  Future<void> addTransacao(String descricao, double valor, String tipo) async {
    DateTime agora = DateTime.now();
    String dataFormatada = "${agora.day.toString().padLeft(2, '0')}/${agora.month.toString().padLeft(2, '0')}/${agora.year}";

    await financeiroCollection.add({
      'descricao': descricao,
      'valor': valor,
      'tipo': tipo, // 'entrada' ou 'saida'
      'data': dataFormatada,
      'criadoEm': FieldValue.serverTimestamp(),
    });
  }
} 