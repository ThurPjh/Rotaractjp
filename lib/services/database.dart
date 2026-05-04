import 'package:cloud_firestore/cloud_firestore.dart';
import '../models/evento_model.dart';
import '../models/usuario_model.dart';

class DatabaseService {
  final CollectionReference eventosCollection = FirebaseFirestore.instance
      .collection('eventos');

  Future<void> addEvento(String nome, String descricao, DateTime data) async {
    await eventosCollection.add({
      'nome': nome,
      'descricao': descricao,
      'data': data,
      'criadoEm': FieldValue.serverTimestamp(),
    });
    // Removendo o 'return' antes do 'await', o erro desaparece!
  }

  // Retorna uma lista de objetos Evento em tempo real
  Stream<List<Evento>> get eventos {
    return eventosCollection.orderBy('data', descending: false).snapshots().map(
      (snapshot) {
        return snapshot.docs.map((doc) => Evento.fromFirestore(doc)).toList();
      },
    );
  }

  // Stream para listar todos os usuários cadastrados
  Stream<List<UsuarioModel>> get membros {
    return FirebaseFirestore.instance
        .collection('usuarios')
        .orderBy('nome')
        .snapshots()
        .map(
          (snapshot) => snapshot.docs
              .map((doc) => UsuarioModel.fromFirestore(doc))
              .toList(),
        );
  }

  // Função para atualizar a lista de IDs de quem foi ao evento
  Future<void> marcarPresenca(String eventoId, List<String> listaIds) async {
    return await eventosCollection.doc(eventoId).update({
      'presencas': listaIds,
    });
  }
}
